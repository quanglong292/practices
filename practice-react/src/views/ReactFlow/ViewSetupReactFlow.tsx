import LayoutSection from "../../components/LayoutSection";
import { Background, Controls, ReactFlow } from "@xyflow/react";

/**
 * @remarks
 * This component is sample of https://reactflow.dev/learn/concepts/building-a-flow#creating-the-flow.
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

const initialEdges = [
    {
      id: 'n1-n2-n3',
      source: 'n1',
      target: 'n2',
      type: 'step',
      label: 'connects with 123',
    },
  ];

const ViewSetupReactFlow = () => {
  return (
    <LayoutSection className="bg-amber-100">
      <ReactFlow nodes={initialNodes} edges={initialEdges}>
        <Background />
        <Controls />
      </ReactFlow>
    </LayoutSection>
  );
};

export default ViewSetupReactFlow;
