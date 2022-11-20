// Thanks to omuretsu
let slp = ms => new Promise(r => setTimeout(r, ms));
let makeNewWindow = async (title = "Default Window Title", theme) => {
	let win = open("steam_appid.txt", title.replaceAll(" ", "_"), "popup=yes,height=200,width=500,left=100,top=100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no");
	await slp(1000);
	let doc = win["document"];
	doc.head.innerHTML = `
  <title>${title}</title>
  <style>
    *{
      margin:0;
    }
    body{
      background:` + theme['backgroundprimary'] + `;
      color:` + theme['primary'] + `;
      overflow:hidden;
      height:100vh;
      width:100vw;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
      display:flex;
      flex-direction:column;
    }
    td{
      background:` + theme['backgroundsecondary'] + `;
      color:` + theme['primary'] + `;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
    }
    a{
      color:` + theme['primary'] + `;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
    }
    warning{
      color:` + theme['error'] + `;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
    }
    .title{
      font-size:20px;
      text-align:center;
      flex: 0 0;
      display:flex;
      align-items:center;
      border-bottom:1px solid white;
    }
    .scrollQuery{
      font-size:12px;
      margin-left:auto;
    }
    .logs{
      width:100%;
      flex: 1;
      overflow-y:scroll;
      font-size:14px;
    }
    .logs::-webkit-scrollbar,::-webkit-scrollbar-corner{
      background:` + theme['button'] + `;
      width:10px;
      height:10px;
    }
    .logs::-webkit-scrollbar-button{
      width:0px;
      height:0px;
    }
    .logs::-webkit-scrollbar-thumb{
      background:` + theme['primary'] + `;
    }
  </style>`
	doc.body.innerHTML = `<div class=title>${title}</div><div class=logs><p></p></div>`;
	let logs = doc.body.querySelector(".logs");
	win.update = (content) => {
		logs.innerHTML = content;
	}
	win.reopen = () => open("steam_appid.txt", title.replaceAll(" ", "_"), "popup=yes,height=200,width=500,left=100,top=100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no");
	return win;
}
