import { Rive, Fit, Layout } from "@rive-app/webgl2";
import "./styles.css";

const el = document.getElementById("rive-canvas");

async function main() {
  const r = new Rive({
    src: "db_health_tracker.riv",
    autoplay: true,
    canvas: el,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: .25
    }),
    stateMachines: "State Machine 1",
    onLoad: () => {
      const vm = r.viewModelByName("VM Main");
      const vmi = vm.instance();
      r.bindViewModelInstance(vmi);

      console.log("View Model Instance", vmi);

      // Main ViewModel
      const vmHeartBars = vmi.viewModel("property of VM Heart Bars")

      // Nested View Models
      const vmSleep = vmi.viewModel("property of VM Sleep")
      const vmHeartRate = vmi.viewModel("property of VM Heart Rate")
      const vmWeight = vmi.viewModel("property of VM Weight")
      const vmSteps = vmi.viewModel("property of VM Steps")

      // View Model Properties
      const timeInBed = vmSleep.number("Time in Bed Total Minutes")
      const timeAsleep = vmSleep.number("Time Asleep Total minutes")
      const actualBpm = vmHeartRate.number("Actual Bpm")
      const restingBpm = vmHeartRate.number("Resting Bpm")
      const actualSteps = vmSteps.number("Actual Steps")
      const weight = vmWeight.number("Weight")
      const mon = vmHeartBars.number("Mon")
      const tue = vmHeartBars.number("Tue")
      const wed = vmHeartBars.number("Wed")
      const thu = vmHeartBars.number("Thu")
      const fri = vmHeartBars.number("Fri")
      const sat = vmHeartBars.number("Sat")
      const sun = vmHeartBars.number("Sun")

      // Set initial values
      timeInBed.value = 722
      timeAsleep.value = 633
      actualBpm.value = 97
      restingBpm.value = 90
      actualSteps.value = 1000
      weight.value = 220
      mon.value = 100
      tue.value = 30
      wed.value = 20
      thu.value = 99
      fri.value = 45
      sat.value = 77
      sun.value = 88

      // repeat every second
      setInterval(() => {
        actualBpm.value = Math.floor(Math.random() * 100)
        actualSteps.value = actualSteps.value += 1
      }, 1000);

      r.resizeDrawingSurfaceToCanvas();
    },
  });

  window.addEventListener(
    "resize",
    () => {
      r.resizeDrawingSurfaceToCanvas();
    },
    false
  );
}

main();
