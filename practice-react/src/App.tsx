import "./App.css";
import LayoutSection from "./components/LayoutSection";
import ViewBasicReactFlow from "./views/ReactFlow/ViewBasicReactFlow";
import ViewSetupReactFlow from "./views/ReactFlow/ViewSetupReactFlow";

function App() {
  return (
    <>
      <LayoutSection>
        <ViewBasicReactFlow />
      </LayoutSection>

      <ViewSetupReactFlow />
    </>
  );
}

export default App;
