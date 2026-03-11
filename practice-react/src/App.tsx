import "./App.css";
import LayoutSection from "./components/LayoutSection";
import DateFns from "./views/DateFns";
import ViewAJAX from "./views/Form/ViewAJAX";
import ViewRerender from "./views/ReactCore/ViewRerender";
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
      {/* <ViewAJAX/> */}
      {/* <DateFns /> */}
      {/* <div className="flex flex-col h-screen">
        {" "}
        <header>Header</header>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="h-[2000px]">Nội dung rất dài...</div>
        </div>
        <footer>Footer</footer>
      </div> */}
      <ViewRerender />
    </>
  );
}

export default App;
