const { getAllData } = require("systeminformation");
const { program } = require("commander");
const { output } = require("./output");

program
  .name("system-info-reader")
  .description("Read system info")
  .version("1.0.0")
  .option("-o, --output <outputs>", "outputs", "console")
  .action(() => {});

program.parse();

const options = program.opts();

const outputs = options.output.split(",").filter((i) => i);

getAllData()
  .then((systemInfo) => {
    output(systemInfo, outputs);
  })
  .catch((reason) => {
    throw new Error(reason || "Unknown error has occured");
  });
