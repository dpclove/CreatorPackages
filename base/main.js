'use strict';

module.exports = {
  load () {
    // execute when package loaded
	console.log("load");
  },

  unload () {
    // execute when package unloaded
	console.log("unload");
  },
  messages: {
	'openPanel' () {
		Editor.Panel.open('base');
	},
	'exportUI'(){
		Editor.Scene.callSceneScript('base', 'exportUIScene', function (err, uuid) {
			// Editor.log('length:'+length);
			Editor.Ipc.sendToPanel('scene', 'scene:query-node', uuid, (error, dump) => {
				if (error)
					return Editor.error(error);
				// JSON.parse(dump);
				Editor.log(dump);
			});
		});
	},
	'testSend2'(){
		Editor.Scene.callSceneScript('base', 'get-canvas-children', function (err, length) {
			// Editor.log('length:'+length);
		});
	}
  }
};