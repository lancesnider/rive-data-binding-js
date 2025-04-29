import { Rive, Fit, Alignment, Layout } from "@rive-app/canvas";
import "./styles.css";

const el = document.getElementById("rive-canvas");

const randomValue = () => Math.random() * 200 - 100;

async function main() {
  const r = new Rive({
    src: "stocks.riv",
    autoplay: true,
    canvas: el,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    stateMachines: "State Machine 1",
    onLoad: () => {
      const dashboardInstance = r.viewModelInstance;
      console.log(dashboardInstance);

      dashboardInstance.string("title").value = "My title";
      const appleStock = dashboardInstance.viewModel("apple");
      appleStock.string("name").value = "AAPL";

      const microsoftStock = dashboardInstance.viewModel("microsoft");
      microsoftStock.string("name").value = "MSFT";

      const teslaStock = dashboardInstance.viewModel("tesla");
      teslaStock.string("name").value = "TSLA";

      appleStock.color("currentColor").on((value) => {
        console.log("Apple Color Changed!", value);
      });

      const updateStocks = () => {
        appleStock.number("num").value = randomValue();
        microsoftStock.number("num").value = randomValue();
        teslaStock.number("num").value = randomValue();

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
