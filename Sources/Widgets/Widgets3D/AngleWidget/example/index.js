import 'vtk.js/favicon';

import vtkActor from 'vtk.js/Rendering/Core/Actor';
import vtkCubeSource from 'vtk.js/Filters/Sources/CubeSource';
import vtkFullScreenRenderWindow from 'vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Rendering/Core/Mapper';
import vtkAngleWidget from 'vtk.js/Widgets/Widgets3D/AngleWidget';
import vtkWidgetManager from 'vtk.js/Widgets/Core/WidgetManager';

import controlPanel from './controlPanel.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderer = fullScreenRenderer.getRenderer();

const cone = vtkCubeSource.newInstance();
const mapper = vtkMapper.newInstance();
const actor = vtkActor.newInstance();

actor.setMapper(mapper);
mapper.setInputConnection(cone.getOutputPort());
actor.getProperty().setOpacity(0.5);

renderer.addActor(actor);

// ----------------------------------------------------------------------------
// Widget manager
// ----------------------------------------------------------------------------

const widgetManager = vtkWidgetManager.newInstance();
widgetManager.setRenderer(renderer);

const widget = vtkAngleWidget.newInstance();
widget.placeWidget(cone.getOutputData().getBounds());

widgetManager.addWidget(widget);

renderer.resetCamera();
widgetManager.enablePicking();

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

widget.getWidgetState().onModified(() => {
  document.querySelector('#angle').innerText = widget.getAngle();
});

document.querySelector('button').addEventListener('click', () => {
  widgetManager.grabFocus(widget);
});

// -----------------------------------------------------------
// globals
// -----------------------------------------------------------

global.widget = widget;
