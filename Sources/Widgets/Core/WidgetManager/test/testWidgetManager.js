import test from 'tape';
import testUtils from 'vtk.js/Sources/Testing/testUtils';
import 'vtk.js/Sources/Rendering/Misc/RenderingAPIs';
import vtkGenericRenderWindow from 'vtk.js/Sources/Rendering/Misc/GenericRenderWindow';
import vtkPolyLineWidget from 'vtk.js/Sources/Widgets/Widgets3D/PolyLineWidget';
import vtkWidgetManager from 'vtk.js/Sources/Widgets/Core/WidgetManager';

import noScaleInPixelsWithPerspectiveBaseline from './testNoScaleInPixelsWithPerspectiveBaseline.png';
import noScaleInPixelsWithParallelBaseline from './testNoScaleInPixelsWithParallelBaseline.png';

import scaleInPixelsWithPerspectiveBaseline from './testScaleInPixelsWithPerspectiveBaseline.png';
import scaleInPixelsWithParallelBaseline from './testScaleInPixelsWithParallelBaseline.png';

test('Test vtkWidgetManager', (t) => {
  const container = document.querySelector('body');
  const rwContainer = document.createElement('div');
  container.appendChild(rwContainer);
  const grw = vtkGenericRenderWindow.newInstance({ listenWindowResize: false });
  grw.setContainer(rwContainer);

  const widgetManager = vtkWidgetManager.newInstance();
  widgetManager.setRenderer(grw.getRenderer());

  const widget = vtkPolyLineWidget.newInstance();
  widgetManager.addWidget(widget);
  widgetManager.getState();
  t.end();

  container.removeChild(rwContainer);
});

test.onlyIfWebGL('Test getPixelWorldHeightAtCoord', (t) => {
  const gc = testUtils.createGarbageCollector();

  const container = document.querySelector('body');
  const rwContainer = gc.registerDOMElement(document.createElement('div'));
  // maintain consistent container size across browsers
  rwContainer.style.width = '300px';
  rwContainer.style.height = '300px';

  container.appendChild(rwContainer);

  const grw = vtkGenericRenderWindow.newInstance({ listenWindowResize: false });
  grw.setContainer(rwContainer);

  const widgetManager = gc.registerResource(vtkWidgetManager.newInstance());
  widgetManager.setRenderer(grw.getRenderer());

  const widget = vtkPolyLineWidget.newInstance();
  const viewWidget = widgetManager.addWidget(widget);
  widget.getWidgetState().addHandle().setOrigin([-10, 50, 100]);
  const handle1 = widget.getWidgetState().addHandle();
  handle1.setOrigin([10, 50, 100]);
  handle1.setScale1(300); // fill total height
  widget.getWidgetState().addHandle().setOrigin([30, 50, 300]);

  const camera = grw.getRenderer().getActiveCamera();
  camera.setPosition(10, 50, 400);
  camera.setFocalPoint(10, 50, 100);
  grw.getInteractor().render();

  function testNoScaleInPixelsWithPerspective() {
    t.comment(
      'testNoScaleInPixelsWithPerspective(): scaleInPixels=false, parallelProjection=false'
    );
    viewWidget.setScaleInPixels(false);
    camera.setParallelProjection(false);
    camera.setParallelScale(1);

    const promise = grw
      .getApiSpecificRenderWindow()
      .captureNextImage()
      .then((image) =>
        testUtils.compareImages(
          image,
          [noScaleInPixelsWithPerspectiveBaseline],
          'Widgets/Core/WidgetManager/test/testNoScaleInPixelsWithPerspective',
          t,
          0.5
        )
      );
    // Trigger a next image
    grw.getInteractor().render();
    return promise;
  }

  function testNoScaleInPixelsWithParallel() {
    t.comment(
      'testNoScaleInPixelsWithParallel(): scaleInPixels=false, parallelProjection=true'
    );
    viewWidget.setScaleInPixels(false);
    camera.setParallelProjection(true);
    camera.setParallelScale(100);

    const promise = grw
      .getApiSpecificRenderWindow()
      .captureNextImage()
      .then((image) =>
        testUtils.compareImages(
          image,
          [noScaleInPixelsWithParallelBaseline],
          'Widgets/Core/WidgetManager/test/testNoScaleInPixelsWithParallel',
          t,
          0.5
        )
      );
    // Trigger a next image
    grw.getInteractor().render();
    return promise;
  }

  function testScaleInPixelsWithPerspective() {
    t.comment(
      'testScaleInPixelsWithPerspective(): scaleInPixels=true, parallelProjection=false'
    );
    viewWidget.setScaleInPixels(true);
    camera.setParallelProjection(false);
    camera.setParallelScale(1);

    const promise = grw
      .getApiSpecificRenderWindow()
      .captureNextImage()
      .then((image) =>
        testUtils.compareImages(
          image,
          [scaleInPixelsWithPerspectiveBaseline],
          'Widgets/Core/WidgetManager/test/testScaleInPixelsWithPerspective',
          t,
          0.5
        )
      );
    // Trigger a next image
    grw.getInteractor().render();
    return promise;
  }

  function testScaleInPixelsWithParallel() {
    viewWidget.setScaleInPixels(true);
    camera.setParallelProjection(true);
    camera.setParallelScale(100);

    const promise = grw
      .getApiSpecificRenderWindow()
      .captureNextImage()
      .then((image) =>
        testUtils.compareImages(
          image,
          [scaleInPixelsWithParallelBaseline],
          'Widgets/Core/WidgetManager/test/scaleInPixelsWithParallel',
          t,
          0.5
        )
      );
    // Trigger a next image
    grw.getInteractor().render();
    return promise;
  }

  return [
    testNoScaleInPixelsWithPerspective,
    testNoScaleInPixelsWithParallel,
    testScaleInPixelsWithPerspective,
    testScaleInPixelsWithParallel,
  ]
    .reduce((current, next) => current.then(next), Promise.resolve())
    .finally(gc.releaseResources);
});
