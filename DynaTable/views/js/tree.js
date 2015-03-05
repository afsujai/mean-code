$(document).ready(function() {
    var currActiveNode;
      // Attach the dynatree widget to an existing <div id="tree"> element
      // and pass the tree options as an argument to the dynatree() function:

    var clipboardNode = null;
    var pasteMode = null;

    function copyPaste(action, node) {
      switch( action ) {
      case "cut":
      case "copy":
        clipboardNode = node;
        pasteMode = action;
        break;
      case "paste":
        if( !clipboardNode ) {
          alert("Clipoard is empty.");
          break;
        }
        if( pasteMode == "cut" ) {
          // Cut mode: check for recursion and remove source
          var isRecursive = false;
          var cb = clipboardNode.toDict(true, function(dict){
            // If one of the source nodes is the target, we must not move
            if( dict.key == node.data.key )
              isRecursive = true;
          });
          if( isRecursive ) {
            alert("Cannot move a node to a sub node.");
            return;
          }
          node.addChild(cb);
          clipboardNode.remove();
        } else {
          // Copy mode: prevent duplicate keys:
          var cb = clipboardNode.toDict(true, function(dict){
            dict.title = "Copy of " + dict.title;
            delete dict.key; // Remove key, so a new one will be created
          });
          node.addChild(cb);
        }
        clipboardNode = pasteMode = null;
        break;
      default:
        alert("Unhandled clipboard action '" + action + "'");
      }
    };

    // --- Contextmenu helper --------------------------------------------------
    function bindContextMenu(span) {
      // Add context menu to this node:
      $(span).contextMenu({menu: "myMenu"}, function(action, el, pos) {
        // The event was bound to the <span> tag, but the node object
        // is stored in the parent <li> tag
        var node = $.ui.dynatree.getNode(el);
        switch( action ) {
        case "cut":
        case "copy":
        case "paste":
          copyPaste(action, node);
          break;
        default:
          alert("Todo: appply action '" + action + "' to node " + node);
        }
      });
    };


    $("#tree").dynatree({
      onActivate: function(node) {
          // A DynaTreeNode object is passed to the activation handler
          // Note: we also get this event, if persistence is on, and the page is reloaded.
          //alert("You activated " + node.data.title);
          currActiveNode = node;
      },
      persist: true,
      children: [ // Pass an array of nodes.
          {title: "Root", isFolder: true
          },
      ],
      onClick: function(node, event) {
        currActiveNode = node;
          // Close menu on click
          if( $(".contextMenu:visible").length > 0 ){
            $(".contextMenu").hide();
    //          return false;
          }
        },
        onDblClick: function(node, event) {
          editNode(node);
          return false;
        },
          onKeydown: function(node, event) {
            // Eat keyboard events, when a menu is open
            if( $(".contextMenu:visible").length > 0 )
              return false;

            switch( event.which ) {

            // Open context menu on [Space] key (simulate right click)
            case 32: // [Space]
              $(node.span).trigger("mousedown", {
                preventDefault: true,
                button: 2
                })
              .trigger("mouseup", {
                preventDefault: true,
                pageX: node.span.offsetLeft,
                pageY: node.span.offsetTop,
                button: 2
                });
              return false;

            // Handle Ctrl-C, -X and -V
            case 67:
              if( event.ctrlKey ) { // Ctrl-C
                copyPaste("copy", node);
                return false;
              }
              break;
            case 86:
              if( event.ctrlKey ) { // Ctrl-V
                copyPaste("paste", node);
                return false;
              }
              break;
            case 88:
              if( event.ctrlKey ) { // Ctrl-X
                copyPaste("cut", node);
                return false;
              }
              break;
            case 113: // [F2]
              editNode(node);
              return false;
            case 13: // [enter]
              if( isMac ){
                editNode(node);
                return false;
              }
            }
          },
          /*Bind context menu for every node when it's DOM element is created.
            We do it here, so we can also bind to lazy nodes, which do not
            exist at load-time. (abeautifulsite.net menu control does not
            support event delegation)*/
          onCreate: function(node, span){
            bindContextMenu(span);
          },
          /*Load lazy content (to show that context menu will work for new items too)*/
          onLazyRead: function(node){
            node.appendAjax({
              url: "sample-data2.json"
            });
          },
          /* D'n'd, just to show it's compatible with a context menu.
             See http://code.google.com/p/dynatree/issues/detail?id=174 */
          dnd: {
            preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
            onDragStart: function(node) {
              return true;
            },
            onDragEnter: function(node, sourceNode) {
              if(node.parent !== sourceNode.parent)
                return false;
              return ["before", "after"];
            },
            onDrop: function(node, sourceNode, hitMode, ui, draggable) {
              sourceNode.move(node, hitMode);
            }
          }
    });


    $("#btnAddCode").click(function(){
      // Sample: add an hierarchic branch using code.
      // This is how we would add tree nodes programatically
      //var rootNode = $("#tree").dynatree("getRoot");

      var childNode = currActiveNode.addChild({
        title: "New Node",
        tooltip: "This folder and all child nodes were added programmatically.",
        isFolder: true
      });
      currActiveNode.expand(true);
      currActiveNode = childNode;
      currActiveNode.activate();
      parent.frames[2].location='editnode.html';
      /*childNode.addChild({
        title: "Document using a custom icon",
          isFolder: false
      });*/
    });

    function editNode(node){
      var prevTitle = node.data.title,
        tree = node.tree;
      // Disable dynatree mouse- and key handling
      tree.$widget.unbind();
      // Replace node with <input>
      $(".dynatree-title", node.span).html("<input id='editNode' value='" + prevTitle + "'>");
      // Focus <input> and bind keyboard handler
      $("input#editNode")
        .focus()
        .keydown(function(event){
          switch( event.which ) {
          case 27: // [esc]
            // discard changes on [esc]
            $("input#editNode").val(prevTitle);
            $(this).blur();
            break;
          case 13: // [enter]
            // simulate blur to accept new value
            $(this).blur();
            break;
          }
        }).blur(function(event){
          // Accept new value, when user leaves <input>
          var title = $("input#editNode").val();
          node.setTitle(title);
          // Re-enable mouse and keyboard handlling
          tree.$widget.bind();
          node.focus();
        });
    }
  });
