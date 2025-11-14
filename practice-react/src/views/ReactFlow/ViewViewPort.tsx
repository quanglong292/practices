import { useCallback, useState } from "react";
import LayoutSection from "../../components/LayoutSection";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  SelectionMode,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";

/**
 * @remarks
 * This component is following https://reactflow.dev/learn/concepts/adding-interactivity.
 */

const initialNodes = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { label: "Node 1" },
    type: "input",
  },
  {
    id: "n2",
    position: { x: 100, y: 100 },
    data: { label: "Node 2" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "n1-n2-n3",
    source: "n1",
    target: "n2",
    type: "step",
    label: "connects with 123",
  },
];

// interface NodeType extends Node {}

const ViewViewPort = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Constants
  const figmaBehaviorConfig = {
    panOnScroll: true,
    selectionOnDrag: true,
    panOnDrag: false,
    selectionMode: SelectionMode.Partial,
  };

  // Functions
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <LayoutSection className="bg-gray-800">
      <ReactFlow
        {...figmaBehaviorConfig}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        selectionKeyCode={[""]}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </LayoutSection>
  );
};

export default ViewViewPort;
