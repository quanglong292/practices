import "./App.css";
import LayoutSection from "./components/LayoutSection";
import DateFns from "./views/DateFns";
import ViewAJAX from "./views/Form/ViewAJAX";
import { Sortable } from "./views/KanBan/_components/Sortable";
import KanBan from "./views/KanBan/KanBan";
import MusicPlayer from "./views/MusicPlayer/MusicPlayer";
import ViewBasicReactFlow from "./views/ReactFlow/ViewBasicReactFlow";
import ViewEvents from "./views/ReactFlow/ViewEvents";
import ViewSetupReactFlow from "./views/ReactFlow/ViewSetupReactFlow";
import ViewViewPort from "./views/ReactFlow/ViewViewPort";
import UndoRedoForm from "./views/UndoRedo/UndoRedoForm";
import FuzzySearch from "./views/FuzzySearch/FuzzySearch";

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
      {/* <KanBan /> */}
      {/* <Sortable /> */}
      {/* <MusicPlayer /> */}
      {/* <UndoRedoForm /> */}
      <FuzzySearch />
    </>
  );
}

export default App;
