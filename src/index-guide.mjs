import { Rive, Fit, Alignment, Layout } from "@rive-app/canvas";
import "./styles.css";

const el = document.getElementById("rive-canvas");

const randomValue = () => Math.random() * 200 - 100;

async function main() {
  const r = new Rive({
    src: "stocks.riv",
    autoplay: true,
    canvas: el,
    // autoBind: true,
    autoBind: false,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    stateMachines: "State Machine 1",
    onLoad: () => {
      // const dashboardInstance = r.viewModelInstance;
      const vm = r.viewModelByName("Dashboard");;
      const dashboardInstance = vm.instance()
      r.bindViewModelInstance(dashboardInstance);
      console.log("Dashboard ViewModel Instance", dashboardInstance);

      dashboardInstance.string("title").value = "My title";

      // dashboardInstance.color("rootColor").rgb(0, 255, 255)
      // dashboardInstance.color("rootColor").rgba(0, 255, 255, 100)
      dashboardInstance.color("rootColor").value = Number.parseInt("ffc0ffee", 16);

      const logoShapeEnum = dashboardInstance.enum("logoShape")
      console.log(logoShapeEnum)
      logoShapeEnum.value = "triangle";

      // Nested artboards

      const appleStock = dashboardInstance.viewModel("apple");
      appleStock.string("name").value = "AAPL";

      const microsoftStock = dashboardInstance.viewModel("microsoft");
      microsoftStock.string("name").value = "MSFT";

      const teslaStock = dashboardInstance.viewModel("tesla");
      teslaStock.string("name").value = "TSLA";

      appleStock.color("currentColor").on((value) => {
        console.log("Apple Color Changed!", value);
      });

      const logoTrigger = dashboardInstance.trigger("triggerSpinLogo")
      const triggerButton = dashboardInstance.trigger("triggerButton")
      triggerButton.on(() => {
        console.log("Button Triggered!");
      });

      const updateStocks = () => {
        const value1 = randomValue();
        const value2 = randomValue();
        const value3 = randomValue();

        appleStock.number("num").value = value1;
        microsoftStock.number("num").value = value2;
        teslaStock.number("num").value = value3;

        if ((value1 > 0 && value2 > 0 && value3 > 0) || (value1 < 0 && value2 < 0 && value3 < 0)) {
          logoTrigger?.trigger();
        }

        setTimeout(updateStocks, 2000);
      };

      updateStocks();

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
