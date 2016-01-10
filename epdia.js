/**
* Demo: http://codepen.io/effus/pen/jWmOWX
*/

var EPDia = {

    containerPath : null,
    Connections : {
        list:[],
        hashes:[],
        create : function(parent,target, line) {
            var con = {
                parent : {
                    data : {
                        node : parent.data('node'),
                        port :  parent.data('port')
                    },
                    dom : parent
                },
                target : {
                    data : {
                        node : target.data('node'),
                        port :  target.data('port')
                    },
                    dom : target
                },
                line : line,
                getHashName : function() {
                    return this.parent.data.node+'_'+this.parent.data.port+':'+this.target.data.node+'_'+this.target.data.port;
                },
                remove : function() {
                    this.line.remove();
                }
            };
            EPDia.Connections.list.push(con);
            EPDia.Connections.hashes[con.getHashName()] = (EPDia.Connections.list.length-1);
            return con;
        },
        getIndexByHash : function(hash) {
            if (typeof EPDia.Connections.hashes[hash] != 'undefined') {
                return EPDia.Connections.hashes[hash];
            } else {
                console.log(EPDia.Connections.hashes,'getIndexByHash');
                throw Error('Connection hash not found: '+hash);
            }
        },
        deleteByHash : function(hash) {
            var index = EPDia.Connections.hashes[hash];
            var con = EPDia.Connections.list[index];
            con.remove();
            var out = {parent:null,target:null};
            out.parent = con.parent;
            out.target = con.target;
            delete EPDia.Connections.hashes[hash];
            EPDia.Connections.list[index]=undefined;
            return out;
        }
    },
    Nodes : {
        list : {},
        addAsJSON : function(json) {
            try {
                var obj = JSON.parse(json);
                if (typeof obj != 'object')
                    throw Error('Could not parse JSON');
                if (typeof obj.name == 'undefined')
                    throw Error('Object hasnt property [name]');
                if (typeof obj.attrs == 'undefined')
                    throw Error('Object hasnt property [attrs]');
                if (typeof obj.name != 'string')
                    throw Error('Object property [name] is not a string');
                if (typeof obj.attrs != 'object')
                    throw Error('Object property [attrs] is not an object: '+typeof obj.attrs);
                if (obj.attrs.length == 0)
                    throw Error('Object property [attrs] is empty array');
                if (typeof obj.attrs[0]!='object')
                    throw Error('First attribute is not object: '+typeof obj.attrs[0]);
                EPDia.Nodes.add(obj);
                EPDia.UI.canvas.renderAll();
            } catch(e) {
                alert(e);
            }
        },
        add : function(obj) {
            if (typeof EPDia.Nodes.list['Node_'+obj.name] != 'undefined') {
                throw Error('Object with same name already exist');
            }
            var node = {
                data : obj,
                domObj : null,
                onNodeDrag : function(event,UI) {
                    var id = $(event.target).attr('id');
                    if (EPDia.Nodes.list[id]) {
                        var domObjects = [];
                        var offset = null;
                        var conIndex = null;
                        if (EPDia.Nodes.list[id].portIn.count > 0) {
                            for (var i in EPDia.Nodes.list[id].portIn.connections) {
                                domObjects[id+'_Port_'+i]=EPDia.Nodes.list[id].portIn.connections[i];
                            }
                            for(var i in domObjects){
                                offset = $('#'+i).offset();
                                for (var j in domObjects[i]) {
                                    conIndex = EPDia.Connections.getIndexByHash(domObjects[i][j]);
                                    if (!EPDia.Connections.list[conIndex]) {
                                        console.log(EPDia.Connections.list);
                                        throw Error('connection not found in index: '+conIndex);
                                    }
                                    EPDia.Connections.list[conIndex].line.set({ x2: offset.left+5, y2: offset.top+5 });
                                }
                            }
                        }
                        if (EPDia.Nodes.list[id].portOut.count > 0) {
                            domObjects = [];
                            for (var i in EPDia.Nodes.list[id].portOut.connections) {
                                domObjects[id+'_Port_'+i]=EPDia.Nodes.list[id].portOut.connections[i];
                            }
                            for(var i in domObjects){
                                offset = $('#'+i).offset();
                                for (var j in domObjects[i]) {
                                    conIndex = EPDia.Connections.getIndexByHash(domObjects[i][j]);
                                    if (!EPDia.Connections.list[conIndex]) {
                                        console.log(EPDia.Connections.list);
                                        throw Error('connection not found in index: '+conIndex);
                                    }
                                    EPDia.Connections.list[conIndex].line.set({ x1: offset.left+5, y1: offset.top+5 });
                                }
                            }
                        }
                        EPDia.UI.canvas.renderAll();
                    }
                },
                portIn : {
                    connections:[],
                    count:0,
                    connect : function() {
                        var offset = $(this).offset();
                        var line = EPDia.UI.drawConnection(offset.top,offset.left);
                        var con = EPDia.Connections.create(EPDia.UI.parent, $(this), line);
                        node.portIn.linkConnections(con);
                    },
                    linkConnections : function(con) {
                        if (typeof node.portIn.connections[con.target.data.port] == 'undefined') {
                            node.portIn.connections[con.target.data.port] = [];
                        }
                        node.portIn.connections[con.target.data.port].push(con.getHashName());
                        node.portIn.count++;
                        console.log('portIn connection created');
                        var parentNodeId = 'Node_'+con.parent.data.node;
                        if (!EPDia.Nodes.list[parentNodeId]) {
                            throw Error('Node not found: '+parentNodeId);
                        }
                        if (typeof EPDia.Nodes.list[parentNodeId].portOut.connections[con.parent.data.port] == 'undefined') {
                            EPDia.Nodes.list[parentNodeId].portOut.connections[con.parent.data.port] = [];
                        }
                        EPDia.Nodes.list[parentNodeId].portOut.connections[con.parent.data.port].push(con.getHashName());
                        EPDia.Nodes.list[parentNodeId].portOut.count++;
                        console.log('portOut connection created');
                    }
                },
                portOut : {
                    connections:[],
                    count:0,
                    startDrag : function(event,UI) {
                        EPDia.UI.startConnectionEvent(event,UI.offset);
                    },
                    stopDrag : function(event) {
                        EPDia.UI.stopConnectionEvent(event);
                    },
                    onDrag : function(event) {
                        EPDia.UI.moveConnectionEvent(event);
                    }
                },
                delete : function(event) {
                    if (confirm('Delete this node?')) {
                        var nodeId = $(this).parent().attr('id');
                        try {
                            if (!EPDia.Nodes.list[nodeId])
                                throw Error('Node not found in node index');
                            var node = EPDia.Nodes.list[nodeId];
                            var domObjects = [];
                            if (node.portIn.count > 0) {
                                for(var i in node.portIn.connections) {
                                    domObjects[nodeId+'_Port_'+i]=node.portIn.connections[i];
                                }
                                for(var i in domObjects){
                                    for (var j in domObjects[i]) {
                                        var conData = EPDia.Connections.deleteByHash(domObjects[i][j]);
                                        //get parent
                                        var parentNodeId = 'Node_'+conData.parent.data.node;
                                        if (typeof EPDia.Nodes.list[parentNodeId].portOut.connections[conData.parent.data.port] != 'undefined') {
                                            var conCount = EPDia.Nodes.list[parentNodeId].portOut.connections[conData.parent.data.port].length;
                                            delete EPDia.Nodes.list[parentNodeId].portOut.connections[conData.parent.data.port];
                                            EPDia.Nodes.list[parentNodeId].portOut.count -= conCount ? conCount : 1;
                                            console.log('delete '+conCount+' connection from parent node: '+parentNodeId);
                                        }
                                    }
                                }
                            }
                            if (node.portOut.count > 0) {
                                for(var i in node.portOut.connections) {
                                    domObjects[nodeId+'_Port_'+i]=node.portOut.connections[i];
                                }
                                for(var i in domObjects){
                                    for (var j in domObjects[i]) {
                                        var conData = EPDia.Connections.deleteByHash(domObjects[i][j]);
                                        //get target
                                        var targetNodeId = 'Node_'+conData.target.data.node;
                                        if (typeof EPDia.Nodes.list[targetNodeId].portIn.connections[conData.target.data.port] != 'undefined') {
                                            var conCount = EPDia.Nodes.list[targetNodeId].portIn.connections[conData.target.data.port].length;
                                            delete EPDia.Nodes.list[targetNodeId].portIn.connections[conData.target.data.port];
                                            EPDia.Nodes.list[targetNodeId].portIn.count -= conCount ? conCount : 1;
                                            console.log('delete '+conCount+' connection from target node: '+targetNodeId);
                                        }
                                    }
                                }
                            }
                            delete EPDia.Nodes.list[nodeId];
                            $(this).parent().remove();
                            console.log('Node removed');
                            console.log( EPDia);
                        } catch(e) {
                            alert(e);
                        }
                    }
                }
            };
            var tpl = $('#node').html();
            $(EPDia.containerPath).append(tpl);
            $(EPDia.containerPath).find('.node:last');
            var nodeObj = $(EPDia.containerPath).find('.node:last');
            nodeObj.attr('id','Node_'+obj.name);
            nodeObj.find('.title').text(obj.name);
            nodeObj.find('.close').click(node.delete);
            for(var j in obj.attrs) {
                var attr = obj.attrs[j];
                var attrTpl = $('#node-attr').html();
                nodeObj.find('ul').append(attrTpl);
                var attrObj = nodeObj.find('ul li:last');
                if (attr.pk) {
                    attrObj.find('.port-out').remove();
                    attrObj.addClass('pk');
                    attrObj.find('.port-in').data({port:attr.name,node:obj.name}).attr('id','Node_'+obj.name+'_Port_'+attr.name);
                } else {
                    attrObj.find('.port-in').remove();
                    attrObj.find('.port-out').data({port:attr.name,node:obj.name}).attr('id','Node_'+obj.name+'_Port_'+attr.name);
                }
                attrObj.find('span.name').html(attr.name);
                attrObj.find('span.type').html(attr.type);
            }
            nodeObj.css({left:50,top:50});
            //node dragged
            nodeObj.draggable({
                grid: [ 100, 100 ],
                scroll: false,
                drag:node.onNodeDrag
            });
            //something connected to port-in
            nodeObj.find('.port-in').droppable({
                hoverClass: "active",
                drop:node.portIn.connect
            });
            //port-out dragged
            nodeObj.find('.port-out').draggable({
                helper:"clone",
                start:node.portOut.startDrag,
                drag:node.portOut.onDrag,
                stop:node.portOut.stopDrag
            });
            node.domObj = nodeObj;
            EPDia.Nodes.list['Node_'+obj.name]=node;
        }
    },

    init : function(params) {
        EPDia.containerPath = params.containerPath ? params.containerPath : EPDia.containerPath;
    },

    UI : {
        canvas : null,
        dragLine: null,
        parent:null,

        activate : function() {
            window.addEventListener('resize', EPDia.UI.resizeCanvas, false);
            EPDia.UI.canvas = new fabric.Canvas('diagram-area', { selection: false });
            EPDia.UI.canvas.selection = false;
            EPDia.UI.resizeCanvas();
        },

        resizeCanvas : function() {
            EPDia.UI.canvas.setHeight(window.innerHeight);
            EPDia.UI.canvas.setWidth(window.innerWidth);
            EPDia.UI.canvas.renderAll();
        },

        startConnectionEvent : function(event,coords) {
            $(event.target).parent().css({color:'#FFF'});
            EPDia.UI.parent = $(event.target);
            var points = [ coords.left+5, coords.top+5, coords.left+5, coords.top+5 ];
            EPDia.UI.dragLine = new fabric.Line(points, {strokeWidth: 2,fill: 'red',stroke: 'grey',originX: 'center',originY: 'center'});
            EPDia.UI.canvas.add(EPDia.UI.dragLine);
        },

        moveConnectionEvent : function(event) {
            EPDia.UI.dragLine.set({ x2: event.clientX, y2: event.clientY });
            EPDia.UI.canvas.renderAll();
        },

        stopConnectionEvent : function(event) {
            EPDia.UI.dragLine.remove();
            $(event.target).parent().css({color:'#000'});
        },

        drawConnection : function(top,left) {
            var line = EPDia.UI.dragLine;
            line.set({ x2: left+5, y2: top+5,selectable:false });
            line.setStroke('black');
            EPDia.UI.canvas.add(line);
            return line;
        }
    },

    Project : {
        getJSON : function() {
            var out = {
                nodes : [],
                connections : []
            };
            out.nodes = jQuery.extend(true, {}, EPDia.Nodes.list);
            out.connections = jQuery.extend(true, {}, EPDia.Connections);
            for(var i in out.nodes) {
                out.nodes[i].offset = out.nodes[i].domObj.offset();
                delete out.nodes[i].domObj;
            }
            for(var i in out.connections.list) {
                out.connections.list[i].coords = [
                    out.connections.list[i].line.x1,
                    out.connections.list[i].line.y1,
                    out.connections.list[i].line.x2,
                    out.connections.list[i].line.y2
                ];
                delete out.connections.list[i]['line'];
                delete out.connections.list[i].parent['dom'];
                delete out.connections.list[i].target['dom'];
                delete out.connections['hashes'];
            }
            return JSON.stringify(out);
        },
        parseJSON : function(json) {
            try {
                var proj = JSON.parse(json);
                for(var i in proj.nodes) {
                    EPDia.Nodes.add(proj.nodes[i].data);
                    var offset = proj.nodes[i].offset;
                    $('#'+i).css(offset);
                }
                for(var i in proj.connections.list) {
                    var doms = {
                        parent:$('#Node_'+proj.connections.list[i].parent.data.node+'_Port_'+proj.connections.list[i].parent.data.port),
                        target:$('#Node_'+proj.connections.list[i].target.data.node+'_Port_'+proj.connections.list[i].target.data.port)
                    };
                    var points = proj.connections.list[i].coords;
                    var line = new fabric.Line(points, {strokeWidth: 2,fill: 'red',stroke: 'grey',originX: 'center',originY: 'center'});
                    EPDia.UI.canvas.add(line);
                    var con = EPDia.Connections.create(doms.parent,doms.target,line);
                    var node = EPDia.Nodes.list['Node_'+proj.connections.list[i].target.data.node]
                    node.portIn.linkConnections(con);
                }
                EPDia.UI.canvas.renderAll();
            } catch(e) {
                alert(e);
            }
        },
        cloneObject : function (obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }
    }
};
