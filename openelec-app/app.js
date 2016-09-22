var actions = {
  shutdown: {
    method: "System.Shutdown",
    params: {},
    confirm: "Shutdown"
  },
  reboot: {
    method: "System.Reboot",
    params: {},
    confirm: "Restart"
  },
  volume_up: {
    method: "Application.SetVolume",
    params: {volume: "increment"}
  },
  volume_down: {
    method: "Application.SetVolume",
    params: {volume: "decrement"}
  },
  mute: {
    method: "Application.SetMute",
    params: {mute: "toggle"}
  },
  play: {
    method: "Player.PlayPause",
    params: {playerid: 1, play: true}
  },
  pause: {
    method: "Player.PlayPause",
    params: {playerid: 1, play: false}
  },
  stop: {
    method: "Player.Stop",
    params: {playerid: 1}
  },
  info: {
    method: "Input.Info",
    params: {}
  },
  up: {
    method: "Input.Up",
    params: {}
  },
  down: {
    method: "Input.Down",
    params: {}
  },
  left: {
    method: "Input.Left",
    params: {}
  },
  right: {
    method: "Input.Right",
    params: {}
  },
  ok: {
    method: "Input.Select",
    params: {}
  },
  back: {
    method: "Input.Back",
    params: {}
  },
  context_menu: {
    method: "Input.ContextMenu",
    params: {}
  },
  home: {
    method: "Input.Home",
    params: {}
  },
  forward1: {
    method: "Player.Seek",
    params: {playerid: 1, value: "smallforward"}
  },
  forward2: {
    method: "Player.Seek",
    params: {playerid: 1, value: "bigforward"}
  },
  backward1: {
    method: "Player.Seek",
    params: {playerid: 1, value: "smallbackward"}
  },
  backward2: {
    method: "Player.Seek",
    params: {playerid: 1, value: "bigbackward"}
  }
};

var addClassName = function(element, className){
   var classNames = (element.className || "").split(" ").filter(function (name){
     return name.length > 0 && name != className;
   });
   classNames.push(className);
   element.className = classNames.join(" ");
};

var removeClassName = function(element, className){
  element.className = (element.className || "").split(" ").filter(function (name){
    return name.length > 0 && name != className;
  }).join(" ");
};

var sendCommand = function (method, params, element){
  var request = new XMLHttpRequest({ mozSystem: true, mozAnon: true });
  
  var after = function (){
    if(element){
       removeClassName(element, "pressed");
    }
  };
  
  var data = JSON.stringify({
    "jsonrpc": "2.0",
    "method": method,
    "id":1, 
    "params": JSON.parse(params)
  });

  try {
    request.open("GET", "http://openelec/jsonrpc?request=" + escape(data));
    request.onload = after;
    request.onerror = after;
    request.send(null);
  } catch (e) {
    alert(e.message);
  } finally {
    after();
  }
};

var run = function (){
  var confirmed = true;
  var confirm1 = this.getAttribute("data-confirm");
  if(confirm1){
    confirmed = confirm("Confirm action: " + confirm1 + ".");
  }
  
  if(confirmed){
    addClassName(this, "pressed");
    var method = this.getAttribute("data-method");
    if(method != null){
      var params = this.getAttribute("data-params");
      if(params != null){
        sendCommand(method, params, this);
      }
    }
  }
};

var createGUI = function (layout){
  var el = function (tag, class1, id) {
    var e = document.createElement(tag);
    if(class1){
      e.className = class1;
    }
    if(id){
      e.id = id;
    }
    return e;
  }

  var buttonGroup = el("div", "button-group");
  for(var i = 0; i < layout.length; i++){
    var line = el("div", "line");
    for(var j = 0; j < layout[i].length; j++){
      var item = layout[i][j];
      var button = el("div", "button" + (item == null ? " empty" : ""), item);
      if(item){
        button.style.backgroundImage = "url(images/" + item + ".png)";
        button.setAttribute("data-method", actions[item].method);
        button.setAttribute("data-params", JSON.stringify(actions[item].params));
        if(actions[item].confirm){
          button.setAttribute("data-confirm", actions[item].confirm);
        }
        button.addEventListener("click", run, false);
      }
      line.appendChild(button);
    }

    line.appendChild(el("div", "clear"));
    buttonGroup.appendChild(line);
  }
  document.getElementById("online").appendChild(buttonGroup);
}

window.addEventListener("load", function() {
  var layout = Array(
    Array("shutdown", "reboot", "home", "info"),
    Array(null, "up", null, "back"),
    Array("left", "ok", "right", "context_menu"),
    Array(null, "down", null, "volume_up"),
    Array("pause", "play", "stop", "volume_down"),
    Array("backward2", "backward1", "forward1", "forward2")
  );

  createGUI(layout);
  
  document.body.className = navigator.onLine ? "online" : "offline";
  
  window.addEventListener("offline", function (){
    document.body.className = "offline";
  }, false);
  
  window.addEventListener("online", function (){
    document.body.className = "online";
  }, false);
});