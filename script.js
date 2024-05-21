let zIndexCounter = 1;
let isResizing = false;
let originalPosition;
const openedWindows = {};

function createWindow(title, content, width = '30%', height = '50%') {
  if (openedWindows[title]) {
    if (openedWindows[title].classList.contains('minimized')) {
      openedWindows[title].classList.remove('minimized');
      openedWindows[title].style.display = 'block'; 
    } else {
      openedWindows[title].style.zIndex = zIndexCounter++;
      openedWindows[title].classList.add('active');
    }
    return;
  }
  
  const window = document.createElement('div');
  window.className = 'window';
  window.style.zIndex = zIndexCounter++;
  window.style.width = width;
  window.style.height = height;
  window.style.top = '50%';
  window.style.left = '50%';
  window.style.transform = 'translate(-50%, -50%)';
  openedWindows[title] = window;

  const maxWidth = parseFloat(width);
  const maxHeight = parseFloat(height);

  const remainingWidth = 100 - maxWidth;
  const remainingHeight = 100 - maxHeight;

  const calculatedLeft = remainingWidth / 2;
  const calculatedTop = remainingHeight / 2;

//  window.style.left = calculatedLeft + '%';
//  window.style.top = calculatedTop + '%';

  let originalLeft = calculatedLeft;
  let originalTop = calculatedTop;
  let originalWidth = width;
  let originalHeight = height;
  let originalzIndex;

  const header = document.createElement('div');
  header.className = 'window-header';
  header.textContent = title;

  const closeButton = document.createElement('button');
  closeButton.className = 'window-close-button';
  closeButton.innerHTML = '<abbr title="Close Window"></abbr>';
  closeButton.addEventListener('click', () => {
    window.classList.remove('active');
    setTimeout(() => {
      window.remove();
      delete openedWindows[title];
    }, 300);
  });

  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'window-minimize-button';
  minimizeButton.textContent = '';
  minimizeButton.addEventListener('click', () => {
    if (!window.classList.contains('minimized')) {
      window.classList.add('minimized');
      window.style.display = 'none';
    } else {
      window.classList.remove('minimized');
      window.style.display = 'block';
      window.style.zIndex = zIndexCounter++;
      window.style.transform = 'scale(1)';
    }
  });

  const maximizeButton = document.createElement('button');
  maximizeButton.className = 'window-maximize-button';
  maximizeButton.textContent = '';
  maximizeButton.addEventListener('click', () => {
    if (!window.classList.contains('maximized')) {
      window.classList.add('maximized');
      originalLeft = window.style.left;
      originalTop = window.style.top;
      originalWidth = window.style.width;
      originalHeight = window.style.height;
      originalzIndex = window.style.zIndex;

      window.style.left = '0';
      window.style.top = '0';
      window.style.width = '100%';
      window.style.height = '100%';
      window.style.transform = 'none';
      window.style.zIndex = '101';
    } else {
      window.classList.remove('maximized');
      window.style.left = originalLeft;
      window.style.top = originalTop;
      window.style.width = originalWidth;
      window.style.height = originalHeight;
      window.style.zIndex = originalzIndex;
      window.style.transform = 'scale(1)';
    }
  });

  header.appendChild(closeButton);
  header.appendChild(minimizeButton);
  header.appendChild(maximizeButton);
  window.appendChild(header);

  const body = document.createElement('div');
  body.className = 'window-body';
  body.innerHTML = content;
  window.appendChild(body);

  let isDragging = false;
  let startPosX, startPosY, startMouseX, startMouseY;

  const bringToFront = () => {
    zIndexCounter += 1;
    window.style.zIndex = zIndexCounter;
  };

  const handleMouseDown = (e) => {
    if (!window.classList.contains('maximized')) {
      isDragging = true;
      startPosX = window.offsetLeft;
      startPosY = window.offsetTop;
      startMouseX = e.clientX;
      startMouseY = e.clientY;

      const iframes = window.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        iframe.style.pointerEvents = 'none';
      });

      bringToFront();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    }
  };

  const handleContentClick = () => {
    bringToFront();
  };

  body.addEventListener('mousedown', handleContentClick);

  const handleMouseMove = (e) => {
    if (isDragging) {
      const offsetX = e.clientX - startMouseX;
      const offsetY = e.clientY - startMouseY;
      window.style.left = startPosX + offsetX + 'px';
      window.style.top = startPosY + offsetY + 'px';
    }
  };

  const handleMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseUp);

    const iframes = window.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.style.pointerEvents = 'auto';
    });
  };

  let isResizing = false;
  let startWidth, startHeight;

  const handleResizeMouseDown = (e) => {
    isResizing = true;
    startWidth = parseFloat(window.style.width);
    startHeight = parseFloat(window.style.height);
    startMouseX = e.clientX;
    startMouseY = e.clientY;

    const iframes = window.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.style.pointerEvents = 'none';
    });

    bringToFront();

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
    document.addEventListener('mouseleave', handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e) => {
    if (isResizing) {
      const offsetX = e.clientX - startMouseX;
      const offsetY = e.clientY - startMouseY;
      const newWidth = Math.max(30, startWidth + offsetX);
      const newHeight = Math.max(30, startHeight + offsetY);

      window.style.width = newWidth + 'px';
      window.style.height = newHeight + 'px';
      bringToFront();
    }
  };

  const handleResizeMouseUp = () => {
    isResizing = false;
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
    document.removeEventListener('mouseleave', handleResizeMouseUp);

    const iframes = window.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.style.pointerEvents = 'auto';
    });
  };

  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  resizeHandle.addEventListener('mousedown', handleResizeMouseDown);
  resizeHandle.addEventListener('mousemove', () => {
    if (isResizing) {
      bringToFront();
    }
  });
  window.appendChild(resizeHandle);

  header.addEventListener('mousedown', handleMouseDown);

  document.body.appendChild(window);

  setTimeout(() => {
    window.classList.add('active');
  }, 10);
}

// App's code
function threekhoh(){
    document.body.innerHTML += '<iframe src="/3kho.html" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>'
}

function asteroid(){
    document.body.innerHTML += '<iframe src="/astroidv3.html" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>'
}

function calculator(){
    document.body.innerHTML += '<iframe src="/calc.html" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>'
}

function dogeproxy(){
    document.body.innerHTML += '<iframe src="/dogeup4.html" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>'
}

function eaglercraft(){
    document.body.innerHTML += '<iframe src="/eaglercraft.1.8.8.html" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>'
}

function impactjs(){
    document.body.innerHTML += '<iframe src="/impactjs.html" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>'
}

function incognito(){
    document.body.innerHTML += '<iframe src="/incognito.html" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>'
}