// @flow

import { List, Record } from 'immutable'
import { createStore } from 'redux'
import colorConversion from './colorConversion'

import { DEFAULT_ZOOM, GRID_SIZE, MAX_ZOOM, MIN_ZOOM } from './configs'

let pixelImageData;

const State = Record({
  centerX: GRID_SIZE / 2, // X coordinate of the camera center in image frame
  centerY: GRID_SIZE / 2, // Y coordinate of the camera center in image frame
  canvasHeight: 0,
  canvasWidth: 0,
  connected: false,
  gridSize: GRID_SIZE,
  headerHeight: 0,
  hoverPixel: null,
  nonce: 0,
  notifications: List(),
  selectedPixel: null,
  selectedSidebar: null,
  sourceImage: null, // HTMLCanvasElement that contains the unmodified image
  zoom: DEFAULT_ZOOM,
});

// If zoom was performed using a mouse, attempt to keep the point under the
// pointer invariant after the zoom. This is similar to the behavior of
// Google Maps
function applyZoomInvariant(state: State, factor: number, x: number, y: number) {
  const currCenterX = state.get('centerX');
  const currCenterY = state.get('centerY');
  const dx = x - currCenterX;
  const dy = y - currCenterY;
  const centerX = currCenterX + dx * factor - dx;
  const centerY = currCenterY + dy * factor - dy;
  return state.merge({ centerX, centerY });
}

function applyZoom(state: State, factor: number, x?: number, y?: number): State {
  if (factor === 1) {
    return state;
  }
  const zoom = state.get('zoom');
  if (zoom === MAX_ZOOM && factor > 1) {
    return state;
  }
  if (zoom === MIN_ZOOM && factor < 1) {
    return state;
  }
  let newZoom = state.get('zoom') * factor;
  newZoom = Math.min(MAX_ZOOM, newZoom);
  newZoom = Math.max(MIN_ZOOM, newZoom);
  const newState = state.merge({ zoom: newZoom });
  return (typeof x === 'undefined' || typeof y === 'undefined')
    ? newState
    : applyZoomInvariant(newState, factor, x, y);
}

function updateDimensions(state: State, headerHeight: number): State {
  const { innerHeight, innerWidth } = window;
  const canvasWidth = innerWidth;
  const canvasHeight = innerHeight - headerHeight;
  return state.merge({ headerHeight, canvasWidth, canvasHeight });
}

function reduce(state: State = new State(), action) {
  switch(action.type) {
    case 'PIXEL_COLOR': {
      const canvas = state.get('sourceImage');
      if (!canvas || !pixelImageData) {
        return state;
      }
      const { pixel } = action;
      const { data } = pixelImageData;
      const { r, g, b } = colorConversion.hexToRgb(pixel.color);
      data[0] = r;
      data[1] = g;
      data[2] = b;
      data[3] = 255;
      canvas.getContext('2d').putImageData(pixelImageData, pixel.x, pixel.y);
      const nonce = state.get('nonce') + 1;
      return state.merge({ sourceImage: canvas, nonce });
    }
    case 'PIXEL_SELECT': {
      const { pixel } = action;
      let selectedSidebar = state.get('selectedSidebar');
      if (pixel) {
        selectedSidebar = 'pixel';
      } else if (selectedSidebar === 'pixel') {
        selectedSidebar = null;
      }
      return state.merge({ selectedPixel: pixel, selectedSidebar });
    }
    case 'PIXEL_HOVER': {
      const { pixel } = action;
      return state.merge({ hoverPixel: pixel });
    }
    case 'RESIZE': {
      return updateDimensions(state, state.get('headerHeight'));
    }
    case 'MOVE': {
      const currCenterX = state.get('centerX');
      const currCenterY = state.get('centerY');
      let { dx, dy } = action;
      if ((currCenterX < 0 && dx < 0) || (currCenterX > GRID_SIZE && dx > 0)) {
        dx = 0;
      }
      if ((currCenterY < 0 && dy < 0) || (currCenterY > GRID_SIZE && dy > 0)) {
        dy = 0;
      }
      if (dx === 0 && dy === 0) {
        return state;
      }
      const zoom = state.get('zoom');
      const centerX = currCenterX + dx / zoom;
      const centerY = currCenterY + dy / zoom;
      return state.merge({ centerX, centerY });
    }
    case 'NAVIGATE_SIDEBAR': {
      const { sidebar } = action;
      return state.merge({ selectedSidebar: sidebar });
    }
    case 'ADD_NOTIFICATION': {
      const { notification } = action;
      if (!notification) {
        return state;
      }
      const notifications = state.get('notifications');
      return state.merge({ notifications: notifications.push(notification) });
    }
    case 'REMOVE_NOTIFICATION': {
      const { notification } = action;
      const { key } = notification;
      let notifications = state.get('notifications');
      notifications = notifications.filter((n) => n.key !== key);
      return state.merge({ notifications });
    }
    case 'SET_CONNECTION': {
      const { connected } = action;
      return state.merge({ connected });
    }
    case 'SET_HEADER': {
      return updateDimensions(state, action.height);
    }
    case 'SET_IMAGE': {
      return state.merge({ sourceImage: action.image });
    }
    case 'ZOOM': {
      const { dy, x, y } = action;
      if (!dy) {
        return state;
      }
      const a = Math.abs(dy) / 100;
      const b = 1.0 + a;
      const factor = dy < 0 ? b : 1/b;
      return applyZoom(state, factor, x, y);
    }
    case 'ZOOM_IN': {
      return applyZoom(state, 2.0);
    }
    case 'ZOOM_OUT': {
      return applyZoom(state, 0.5);
    }
    default:
      return state;
  }
}

const store = createStore(reduce);

window.addEventListener('resize', () => store.dispatch({ type: 'RESIZE' }));

// Load initial image from the server
function loadImage() {
  const canvas = document.createElement('canvas');
  canvas.height = GRID_SIZE;
  canvas.width = GRID_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Create a pixel for drawing later
  pixelImageData = ctx.createImageData(1, 1);

  // Load cached image from server
  const image = new Image();
  image.src = '/img/place.png';
  image.onload = function() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1000);
    ctx.drawImage(image, 0, 0);
    store.dispatch({ type: 'SET_IMAGE', image: canvas });
    store.dispatch({ type: 'RESIZE' });
  };
}
loadImage();

// store.subscribe(() => console.log(store.getState()));

export default store
