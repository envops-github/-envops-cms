const fs = require("fs");

function output(info, outputs) {
  outputs.map((o) => {
    if (o == "console") {
      console.log(info);
    }

    if (o == "file") {
      fs.writeFileSync("system-info.json", JSON.stringify(info));
    }
  });
}

exports.output = output;
