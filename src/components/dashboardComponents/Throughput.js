import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";
import useThroughputChart from "../../customHooks/dashboardCharts/useThroughputChart";
import useMediaQuery from "@mui/material/useMediaQuery";

function Throughput(props) {
  const [machine, setMachine] = useState("1");
  const throughputChart = useThroughputChart(props.date, machine);
  const sizeSmall = useMediaQuery("(max-width:992px)");

  const handleMachineChange = (e) => {
    setMachine(e.target.value); // Update the machine state with the selected value.
  };

  const machineArray = Array.from({ length: 40 }, (_, index) =>
    (index + 1).toString()
  );

  return (
    <div className="chart area-chart">
      <div className="autocomplete-container">
        <h5>Throughput</h5>
        <TextField
          select
          size="large"
          margin="normal"
          variant="outlined"
          label="Select Machine"
          sx={{ width: sizeSmall ? 150 : 300 }}
          value={machine}
          onChange={handleMachineChange}
        >
          {machineArray.map((machine) => {
            return (
              <MenuItem key={machine} value={machine}>
                {machine}
              </MenuItem>
            );
          })}
        </TextField>
      </div>

      <ReactApexChart
        options={throughputChart.options}
        series={throughputChart.series}
        type="line"
        height={350}
      />
    </div>
  );
}

export default Throughput;
