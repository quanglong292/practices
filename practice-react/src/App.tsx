import "./App.css";
import LayoutSection from "./components/LayoutSection";
import ViewBasicReactFlow from "./views/ReactFlow/ViewBasicReactFlow";
import ViewEvents from "./views/ReactFlow/ViewEvents";
import ViewSetupReactFlow from "./views/ReactFlow/ViewSetupReactFlow";

function App() {
  return (
    <>
      {/* <LayoutSection>
        <ViewBasicReactFlow />
      </LayoutSection> */}

      {/* <ViewSetupReactFlow /> */}
      <ViewEvents />
    </>
  );
}

export default App;
