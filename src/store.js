// @flow

import { Record } from 'immutable'
import { createStore } from 'redux'
import colorConversion from './colorConversion'

import { GRID_SIZE } from './configs'

let pixelImageData;

const State = Record({
  centerX: GRID_SIZE / 2, // X coordinate of the camera center in image frame
  centerY: GRID_SIZE / 2, // Y coordinate of the camera center in image frame
  canvasHeight: 0,
  canvasWidth: 0,
  gridSize: GRID_SIZE,
  headerHeight: 0,
  hoverX: null, // X coordinate of the mouseover pixel in image frame
  hoverY: null, // Y coordinate of the mouseover pixel in image frame
  selectedPixel: null,
  sourceImage: null, // HTMLCanvasElement that contains the unmodified image
  zoom: 4,
});

function applyZoom(state: State, factor: number): State {
  const zoom = state.get('zoom') * factor;
  if (zoom > 8 || zoom < 0.25) {
    return state;
  }
  return state.merge({ zoom });
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
      return state.merge({ sourceImage: canvas });
    }
    case 'PIXEL_SELECT': {
      const { pixel } = action;
      // console.log(pixel);
      // const zoom = state.get('zoom');
      // if (zoom < 2) {
      //   return applyZoom(state, 2);
      // }
      return state.merge({ selectedPixel: pixel });
    }
    case 'PIXEL_HOVER': {
      const { x, y } = action;
      return state.merge({ hoverX: x, hoverY: y });
    }
    case 'RESIZE': {
      return updateDimensions(state, state.get('headerHeight'));
    }
    case 'SCROLL': {
      const { dx, dy } = action;
      if (dx === 0 && dy === 0) {
        return state;
      }
      const zoom = state.get('zoom');
      const centerX = state.get('centerX') + dx / zoom;
      const centerY = state.get('centerY') + dy / zoom;
      if (centerX < 0 || centerY < 0 || centerX > GRID_SIZE || centerY > GRID_SIZE) {
        return state;
      }
      return state.merge({ centerX, centerY });
    }
    case 'SET_HEADER': {
      return updateDimensions(state, action.height);
    }
    case 'SET_IMAGE': {
      return state.merge({ sourceImage: action.image });
    }
    case 'ZOOM_IN': {
      return applyZoom(state, 2);
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
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1000, 1000);
    // ctx.drawImage(image, 0, 0);
    store.dispatch({ type: 'SET_IMAGE', image: canvas });
  };
}
loadImage();

// store.subscribe(() => console.log(store.getState()));

export default store
