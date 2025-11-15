import "./App.css";
import LayoutSection from "./components/LayoutSection";
import ViewAJAX from "./views/Form/ViewAJAX";
import ViewBasicReactFlow from "./views/ReactFlow/ViewBasicReactFlow";
import ViewEvents from "./views/ReactFlow/ViewEvents";
import ViewSetupReactFlow from "./views/ReactFlow/ViewSetupReactFlow";
import ViewViewPort from "./views/ReactFlow/ViewViewPort";

function App() {
  return (
    <>
      {/* <LayoutSection>
        <ViewBasicReactFlow />
      </LayoutSection> */}

      {/* <ViewSetupReactFlow /> */}
      {/* <ViewEvents /> */}
      {/* <ViewViewPort /> */}
      <ViewAJAX/>
    </>
  );
}

export default App;