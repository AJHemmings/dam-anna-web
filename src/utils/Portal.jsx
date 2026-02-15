import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal - Renders children into a dedicated DOM node outside the main React tree.
 * 
 * This prevents modal mounting from causing layout recalculation on sibling
 * elements (Navigation, Container, main), which was causing a visible jolt.
 * 
 * The portal container is created once and appended to document.body.
 */

// Create the portal container once (outside component lifecycle)
let portalRoot = null;

function getPortalRoot() {
  if (!portalRoot) {
    portalRoot = document.getElementById('modal-root');
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'modal-root';
      document.body.appendChild(portalRoot);
    }
  }
  return portalRoot;
}

export default function Portal({ children }) {
  return createPortal(children, getPortalRoot());
}
