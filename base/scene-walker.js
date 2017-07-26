const Path = require('path');
const Fs = require('fire-fs');
var resourcePath = '';
var scriptsPath = '';
const AssetsRootUrl = 'db://assets/resources/ui';
const scriptsRootUrl = 'db://assets/script/ui';


function StringBuilder()
{
    this._buffers = [];
    this._length=0;
    this._splitChar = arguments.length>0 ? arguments[arguments.length-1] : '';

    if(arguments.length>0)
    {
        for(var i=0,iLen=arguments.length-1;i<iLen;i++)
        {
            this.Append(arguments[i]);
        }
    }
}
StringBuilder.prototype.Append=function(str)
{        
    this._length += str.length;
    this._buffers[this._buffers.length] = str;
	return this;
}

StringBuilder.prototype.AppendLine=function(str)
{        
    this._length += str.length;
    this._buffers[this._buffers.length] = str+'\n';
	return this;
}

StringBuilder.prototype.Add = StringBuilder.prototype.append;

StringBuilder.prototype.AppendFormat=function()
{
     if(arguments.length>1)
     {
        var TString=arguments[0];
        if(arguments[1] instanceof Array)
        {
            for(var i=0,iLen=arguments[1].length;i<iLen;i++)
            {
                var jIndex=i;
                var re=eval("/\\{"+jIndex+"\\}/g;");
                TString= TString.replace(re,arguments[1][i]);
            }
        }
        else
        {
            for(var i=1,iLen=arguments.length;i<iLen;i++)
            {
                var jIndex=i-1;
                var re=eval("/\\{"+jIndex+"\\}/g;");
                TString= TString.replace(re,arguments[i]); 
            }
        }
        this.Append(TString);
     }
     else if(arguments.length==1)
     {
        this.Append(arguments[0]);
     }
}

StringBuilder.prototype.Length=function()
{    
    if(this._splitChar.length>0 && (!this.IsEmpty())) 
    {
        return  this._length + ( this._splitChar.length * ( this._buffers.length-1 ) ) ;
    }
    else
    {
        return this._length;
    }
}

StringBuilder.prototype.IsEmpty=function()
{    
    return this._buffers.length <= 0;
}

StringBuilder.prototype.Clear = function()
{
    this._buffers = [];
    this._length=0;
}

StringBuilder.prototype.ToString = function()
{
    if(arguments.length==1)
    {
		return this._buffers.join();
    }
    else
    {
		return this._buffers.join(this._splitChar);
    }
}
//3a95f966-81f1-460b-87d1-af1972357a75, db://assets/resources/raw/ui
const TAB1 = "\t";
const TAB2 = "\t\t";
const TAB3 = "\t\t\t";
const TAB4 = "\t\t\t\t";
const TAB5 = "\t\t\t\t\t";

const VIEW_UI = "ViewUI";
const VIEW_PROPERTY = "ViewProperty";
const MASK_SPRITE = "MaskSprite";
const CREAT_EROOM_INNER = "CreateRoomInner";
const VIEW_CELL = "ViewCell";

module.exports = {
    'exportUIScene': function (event) {
        var canvas = cc.find('Canvas');
		var path = Path.join(Editor.remote.projectPath,'assets','resources');
		resourcePath = path;
		scriptsPath = Path.join(Editor.remote.projectPath,'assets','script');
        Editor.log('ExportUISceneStart');
		Editor.log(Editor.remote.projectPath);
		// var childs = canvas.children;
		// for(var i = 0;i<childs.length ;i++){
			// if(childs[i].group == 'ui'){
				// var uichilds = childs[i].children;
				// this.checkChild(uichilds);
			// }
		// }
		var ui = cc.find('Canvas/UI');
		if(ui!=null){
			Editor.log('have');
			var uichilds = ui.children;
			this.checkChild(uichilds);
		}
		Editor.assetdb.refresh(AssetsRootUrl,function (err, results) {
			
		});
		Editor.assetdb.refresh(scriptsRootUrl,function (err, results) {
			
		});
		
        Editor.log('ExportUISceneEnd');
    },
	checkChild:function(uichilds){
		for(var i = 0;i<uichilds.length ;i++){
			if(uichilds[i].group == VIEW_UI){
				this.makeScript(uichilds[i]);
				this.makePrefab(uichilds[i]);
				// if(uichilds[i].group == CREAT_EROOM_INNER){
				uichilds[i].parent = null;
				// }
				
			}else if(uichilds[i].group == CREAT_EROOM_INNER){
				this.makeScript2(uichilds[i]);
				this.makePrefab2(uichilds[i]);
				uichilds[i].parent = null;
			}
		}
	},
	makePrefab:function(node){
		// Editor.log(node.uuid);
		
		var animFile = node.name;
		var prefabPath = Path.join(resourcePath,'ui','prefab', animFile + '.prefab')
		Editor.log(resourcePath);
		Editor.log(prefabPath);
		Fs.ensureDirSync(Path.dirname(prefabPath));
		var prefab = _Scene.PrefabUtils.createPrefabFrom(node);
		var prefabData = Editor.serialize(prefab);
		Fs.writeFileSync(prefabPath, prefabData);
		

	},
	makeScript:function(node){
		var name = this.UpperFirstLetter(node.name);
		var prefabName = node.name;
		var prefabPath = Path.join(scriptsPath,'ui','baseviews', 'Base'+name + 'View.js');
		Editor.log(prefabPath)
		var outOp = [];
		var btnOp = [];
		var nameGroup = {};
		var createGroup = [];
		var listViewOp = [];
		var path = '';
		this.getAllChildInfo(node,path,outOp,btnOp,nameGroup,createGroup,listViewOp,true);
		
		for(var i=0;i<createGroup.length;i++){
			this.makeScript2(createGroup[i]);
			this.makePrefab2(createGroup[i]);
			createGroup[i].parent = null;
			// Editor.log(' createGroup  '+createGroup[i].name);
		}
		for(var i =0;i<outOp.length;i++){
			Editor.log(outOp[i].name);
		}
		var code = this.generateClass(name,'View','',prefabName,outOp,btnOp,listViewOp);
		Fs.ensureDirSync(Path.dirname(prefabPath));
		var codeData = code;
		Fs.writeFileSync(prefabPath, codeData);
		Editor.log(code);
	},
	makeScript2:function(node){
		var name = this.UpperFirstLetter(node.name);
		var prefabName = 'inner/'+node.name;
		var prefabPath = Path.join(scriptsPath,'ui','baseviews','inner', 'Base'+name + 'Inner.js');
		Editor.log(prefabPath)
		var outOp = [];
		var btnOp = [];
		var nameGroup = {};
		var createGroup = [];
		var listViewOp = [];
		var path = '';
		this.getAllChildInfo(node,path,outOp,btnOp,nameGroup,createGroup,listViewOp,true);
		
		// for(var i=0;i<createGroup.length;i++){
			// this.makeScript(createGroup[i]);
			// this.makePrefab(createGroup[i]);
			// Editor.log(' createGroup  '+createGroup[i].name);
		// }
		for(var i =0;i<outOp.length;i++){
			Editor.log(outOp[i].name);
		}
		var code = this.generateClass(name,'Inner','../',prefabName,outOp,btnOp,listViewOp);
		Fs.ensureDirSync(Path.dirname(prefabPath));
		var codeData = code;
		Fs.writeFileSync(prefabPath, codeData);
		Editor.log(code);
	},
	makePrefab2:function(node){
		// Editor.log(node.uuid);
		
		var animFile = node.name;
		var prefabPath = Path.join(resourcePath,'ui','prefab','inner', animFile + '.prefab')
		Editor.log(resourcePath);
		Editor.log(prefabPath);
		Fs.ensureDirSync(Path.dirname(prefabPath));
		var prefab = _Scene.PrefabUtils.createPrefabFrom(node);
		var prefabData = Editor.serialize(prefab);
		Fs.writeFileSync(prefabPath, prefabData);
		

	},
	getAllChildInfo:function(node,path,outOp,btnOp,nameGroup,createGroup,listViewOp,isRoot){
		
		var nodeName = '';
		if(!isRoot){
			if(path != ''){
				nodeName = path+'/'+node.name;
			}else{
				nodeName = node.name;
			}
		}
		var comName = node.name;
		if(nameGroup[comName] == null || nameGroup[comName] == undefined){
			nameGroup[comName] = 0;
		}else{
			nameGroup[comName] = nameGroup[comName] + 1;
			comName = comName+"_"+nameGroup[comName];
		}
		var isReturn = false;
		
		if(node.group == VIEW_PROPERTY || node.group == MASK_SPRITE){
			var typeValue = 'cc.Node';
			if(node.getComponent(cc.ScrollView)!= null){
				typeValue = 'cc.ScrollView';
			}else if(node.getComponent('MaskSprite')!= null){
				typeValue = 'MaskSprite';
			}else if(node.getComponent(cc.Toggle) != null){
				typeValue = 'cc.Toggle';
			}else if(node.getComponent(cc.Button) != null){
				typeValue = 'cc.Button';
				btnOp.push({name:comName,path:nodeName,type:typeValue});
			}else if(node.getComponent(cc.Sprite) != null){
				typeValue = 'cc.Sprite';
			}else if(node.getComponent(cc.EditBox)!= null){
				typeValue = 'cc.EditBox';
			}else if(node.getComponent(cc.RichText)!= null){
				typeValue = 'cc.RichText';
			}else if(node.getComponent(cc.Label)!= null){
				typeValue = 'cc.Label';
			}else if(node.getComponent(cc.PageView)!= null){
				typeValue = 'cc.PageView';
			}else if(node.getComponent('PageViewIndicatorSelf') != null){
				typeValue = 'PageViewIndicatorSelf';
			}else if(node.getComponent('NumChose') != null){
				typeValue = 'NumChose';
				isReturn = true;
			}
			outOp.push({name:comName,path:nodeName,type:typeValue});
		// }else if(node.group == MASK_SPRITE){
			// var typeValue = MASK_SPRITE;
			// outOp.push({name:comName,path:nodeName,type:typeValue});
		}else if(node.group == CREAT_EROOM_INNER){
			// this.checkChild(node);
			// this.makeScript(node);
			// this.makePrefab(node);
			if(!isRoot){
				createGroup.push(node);
				return;
			}
		}else if(node.group == VIEW_CELL){
			var typeValue = 'cc.Node';
			node.active = false;
			outOp.push({name:comName,path:nodeName,type:typeValue});
			isReturn = true;
		}else{
			if(node.getComponent(cc.Slider) != null){
				var typeValue = 'cc.Slider';
				outOp.push({name:comName,path:nodeName,type:typeValue});
				isReturn = true;
			}
			
			if(node.getComponent('MaskSprite')!= null){
				var typeValue = 'MaskSprite';
				outOp.push({name:comName,path:nodeName,type:typeValue});
			}else if(node.getComponent(cc.Toggle) != null){
				var typeValue = 'cc.Toggle';
				//btnOp.push({name:comName,path:nodeName,type:typeValue});
				outOp.push({name:comName,path:nodeName,type:typeValue});
			}else if(node.getComponent(cc.Button) != null){
				var typeValue = 'cc.Button';
				btnOp.push({name:comName,path:nodeName,type:typeValue});
				outOp.push({name:comName,path:nodeName,type:typeValue});
			}else if(node.getComponent(cc.EditBox)!= null){
				var typeValue = 'cc.EditBox';
				outOp.push({name:comName,path:nodeName,type:typeValue});
			}else if(node.getComponent('NumChose') != null){
				var typeValue = 'NumChose';
				outOp.push({name:comName,path:nodeName,type:typeValue});
				isReturn = true;
			}else if(node.getComponent('ListViewCtrl')){
				var typeValue = '"ListViewCtrl"';
				listViewOp.push({name:comName,path:nodeName,type:typeValue});
				outOp.push({name:comName,path:nodeName,type:typeValue});
				isReturn = true;
			}
		}
		if(isReturn == true){
			return;
		}
		for(var i=0;i<node.children.length;i++){
			this.getAllChildInfo(node.children[i],nodeName,outOp,btnOp,nameGroup,createGroup,listViewOp,false);
		}
	},
	GetComName :function(name){
		
	},
	UpperFirstLetter:function(str){
		str = str.replace(' ','');
		return str.substr(0,1).toUpperCase() + str.substr(1);
	},
	LowerFirstLetter:function(str){
		str = str.replace(' ','');
		return str.substr(0,1).toLowerCase() + str.substr(1);
	},
	generateClass : function(name,endName,spName,prefabName,outOp,btnOp,listViewOp){
		
		var code = new StringBuilder('');
		var className = 'Base'+name+endName;//'View';
		code.AppendLine('/**');
		code.AppendLine('*CreateBySystem did not editor');
		code.AppendLine('*ClassName ' + className);
		code.AppendLine('*/');
		
		
		code.AppendLine('var ViewBase = require(\''+spName+'../viewMgr/ViewBase\');');
		code.AppendLine('var MaskSprite = require(\''+spName+'../viewMgr/MaskSprite\');');
		code.AppendLine('var PageViewIndicatorSelf = require(\''+spName+'../scrollview/PageViewIndicatorSelf\');');
		code.AppendLine('var NumChose = require(\''+spName+'../templates/NumChose\');');
		
		
		code.AppendLine('cc.Class({');
		Editor.log(name);
	
		//code.Append(TAB1).AppendLine('name:"'+className+'",');
		
		code.Append(TAB1).AppendLine('extends: ViewBase,');
		
		code.Append(TAB1).AppendLine('statics: {');
		code.Append(TAB2).AppendLine('prefabName : "'+prefabName+'",');
		code.Append(TAB2).AppendLine('viewName :"'+className+'",');
		code.Append(TAB1).AppendLine('},');
		
		code.Append(TAB1).AppendLine('properties: {');
		for(var i=0;i<outOp.length;i++){
			if(outOp[i].type!='"ListViewCtrl"'){
				code.Append(TAB2).AppendLine('_'+this.LowerFirstLetter(outOp[i].name)+':'+outOp[i].type+',');
			}
		}
		code.Append(TAB1).AppendLine('},');
		
		// code.Append(TAB1).AppendLine('onLoad: function () {');
		// code.Append(TAB2).AppendLine('this.doCreate();');
		// code.Append(TAB1).AppendLine('},');
		
		code.Append(TAB1).AppendLine('doCreate: function () {');
		for(var i=0;i<outOp.length;i++){
			if(outOp[i].type =='cc.Node'){
				code.Append(TAB2).AppendLine('this._'+this.LowerFirstLetter(outOp[i].name)+' = cc.find("'+outOp[i].path+'",this.node);');
			}else{
				code.Append(TAB2).AppendLine('this._'+this.LowerFirstLetter(outOp[i].name)+' = cc.find("'+outOp[i].path+'",this.node).getComponent('+outOp[i].type+');');
				if(outOp[i].type == 'MaskSprite'){
					code.Append(TAB2).AppendLine('this.initMaskSprite(this._'+this.LowerFirstLetter(outOp[i].name)+');');
				}else if(outOp[i].type == 'cc.Toggle'){
					code.Append(TAB2).AppendLine('this.addToggleClick(this._'+this.LowerFirstLetter(outOp[i].name)+');');
				}else if(outOp[i].type == 'cc.Slider'){
					code.Append(TAB2).AppendLine('this.addSlideEvent(this._'+this.LowerFirstLetter(outOp[i].name)+');');
				}
			}
			
		}
		
		for(var i =0;i<btnOp.length;i++){
		
			code.Append(TAB2).AppendLine('this.addButtonClick(this._'+this.LowerFirstLetter(btnOp[i].name)+');');
		}
	
		code.Append(TAB1).AppendLine('},');
		
		
		code.Append(TAB1).AppendLine('addButtonClick: function (button) {');
		
		code.Append(TAB2).AppendLine('var clickEventHandler = new cc.Component.EventHandler();');
		code.Append(TAB2).AppendLine('clickEventHandler.target = this.node;');
        code.Append(TAB2).AppendLine('clickEventHandler.component = "'+className+'";');
        code.Append(TAB2).AppendLine('clickEventHandler.handler = "onButtonClick";');
		code.Append(TAB2).AppendLine('clickEventHandler.customEventData = "button";');
		code.Append(TAB2).AppendLine('button.clickEvents.push(clickEventHandler);');
		
		code.Append(TAB1).AppendLine('},');
		
		code.Append(TAB1).AppendLine('onButtonClick:function (event,customEventData) {');
		code.Append(TAB2).AppendLine('this._super();');
        code.Append(TAB2).AppendLine('this.onButtonClicked(event,customEventData);');
		code.Append(TAB1).AppendLine('},');
		
		code.Append(TAB1).AppendLine('onButtonClicked:function (event,customEventData) {');

		code.Append(TAB2).AppendLine('//need extend');
		code.Append(TAB1).AppendLine('},');
		
		code.Append(TAB1).AppendLine('addToggleClick: function (toggle) {');
		
		code.Append(TAB2).AppendLine('var clickEventHandler = new cc.Component.EventHandler();');
		code.Append(TAB2).AppendLine('clickEventHandler.target = this.node;');
        code.Append(TAB2).AppendLine('clickEventHandler.component = "'+className+'";');
        code.Append(TAB2).AppendLine('clickEventHandler.handler = "onToggleClick";');
		code.Append(TAB2).AppendLine('clickEventHandler.customEventData = "toggle";');
		code.Append(TAB2).AppendLine('toggle.checkEvents.push(clickEventHandler);');
		
		code.Append(TAB1).AppendLine('},');
		
		code.Append(TAB1).AppendLine('onToggleClick:function (target,customEventData) {');
		code.Append(TAB2).AppendLine('this._super();');
        code.Append(TAB2).AppendLine('this.onToggleClicked(target,customEventData);');
		code.Append(TAB1).AppendLine('},');
		code.Append(TAB1).AppendLine('onToggleClicked:function (target,customEventData) {');

		code.Append(TAB2).AppendLine('//need extend');
		code.Append(TAB1).AppendLine('},');
		
		
		
		code.Append(TAB1).AppendLine('addSlideEvent:function (slider) {')
        code.Append(TAB2).AppendLine('var eventHandler = new cc.Component.EventHandler();')
        code.Append(TAB2).AppendLine('eventHandler.target = this.node;')
        code.Append(TAB2).AppendLine('eventHandler.component = "'+className+'";');
		code.Append(TAB2).AppendLine('eventHandler.handler = "onSlideEvent";')
        code.Append(TAB2).AppendLine('slider.slideEvents.push(eventHandler);')
		code.Append(TAB1).AppendLine('},')
		code.Append(TAB1).AppendLine('onSlideEvent:function (sender, eventType) {')
		code.Append(TAB2).AppendLine('this._super();')
		code.Append(TAB2).AppendLine('this.onSlideEventBack(sender, eventType);')
		code.Append(TAB1).AppendLine('},')
		code.Append(TAB1).AppendLine('onSlideEventBack:function (sender, eventType) {')
			
		code.Append(TAB1).AppendLine('},')
		
		
		
		code.Append(TAB1).AppendLine('onMaskSpriteTouched:function () {');
		code.Append(TAB2).AppendLine('//need extend');
		code.Append(TAB1).AppendLine('},');
		
		if(listViewOp.length>0){
			code.Append(TAB1).AppendLine('//TODO ListView');
		}
		
		
		code.Append('});');
		return code.ToString();
	}
};