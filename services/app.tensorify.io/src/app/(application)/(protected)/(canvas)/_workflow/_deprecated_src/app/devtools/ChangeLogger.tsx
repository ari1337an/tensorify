import { useEffect, useRef, useState } from "react";
import {
  useStore,
  useStoreApi,
  type OnNodesChange,
  type NodeChange,
} from "@xyflow/react";

type ChangeLoggerProps = {
  color?: string;
  limit?: number;
};

type ChangeInfoProps = {
  change: NodeChange;
};

function ChangeInfo({ change }: ChangeInfoProps) {
  const id = "id" in change ? change.id : "-";
  const { type } = change;

  return (
    <div
      style={{ marginBottom: 4, marginTop: 4 }}
      className="bg-slate-700 px-2 py-1 rounded-sm w-fit"
    >
      <div>
        <strong>node id:</strong> {id}
      </div>
      <div>
        {type === "add" && (
          <pre>
            <strong>change.item:</strong> {JSON.stringify(change.item, null, 2)}
          </pre>
        )}
        {type === "dimensions" && (
          <div>
            <strong>dimensions:</strong> {change.dimensions?.width} ×{" "}
            {change.dimensions?.height}
          </div>
        )}
        {type === "position" && (
          <div>
            <strong>position:</strong> {change.position?.x.toFixed(1)},{" "}
            {change.position?.y.toFixed(1)}
          </div>
        )}
        {type === "remove" && (
          <div>
            <strong>action:</strong> remove
          </div>
        )}
        {type === "select" && (
          <div>
            <strong>action:</strong> {change.selected ? "select" : "unselect"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChangeLogger({ limit = 6 }: ChangeLoggerProps) {
  // You can manually set the number of ChangeInfo entries to show by changing this variable
  const maxChangesToShow = limit;

  const [changes, setChanges] = useState<NodeChange[]>([]);
  const onNodesChangeIntercepted = useRef(false);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const store = useStoreApi();

  useEffect(() => {
    if (!onNodesChange || onNodesChangeIntercepted.current) {
      return;
    }

    onNodesChangeIntercepted.current = true;
    const userOnNodesChange = onNodesChange;

    const onNodesChangeLogger: OnNodesChange = (latestChanges) => {
      userOnNodesChange(latestChanges);
      setChanges((oldChanges) =>
        [...latestChanges, ...oldChanges].slice(0, maxChangesToShow)
      );
    };

    store.setState({ onNodesChange: onNodesChangeLogger });
  }, [onNodesChange, maxChangesToShow, store]);

  return (
    <div className="react-flow__devtools-changelogger mt-28 mb-20 ml-4">
      <div className="react-flow__devtools-title bg-white rounded-sm px-2 py-2 w-fit text-black">
        Change Logger
      </div>
      {changes.length === 0 ? (
        <div className="bg-slate-700 px-2 py-1 rounded-sm w-fit mt-1">
          no changes triggered
        </div>
      ) : (
        changes.map((change, index) => (
          <ChangeInfo key={index} change={change} />
        ))
      )}
    </div>
  );
}
