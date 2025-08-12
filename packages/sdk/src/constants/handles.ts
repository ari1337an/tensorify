import {
  EdgeType,
  HandlePosition,
  HandleViewType,
  InputHandle,
  OutputHandle,
} from "../types/visual";

export const PrevNodeAsInput: InputHandle = {
  id: "prev",
  position: HandlePosition.LEFT,
  viewType: HandleViewType.DEFAULT,
  required: true,
  label: "Prev",
  edgeType: EdgeType.DEFAULT,
  dataType: "any",
  description: "Previous node output",
};

export const NextNodeAsOutput: OutputHandle = {
  id: "next",
  position: HandlePosition.RIGHT,
  viewType: HandleViewType.DEFAULT,
  label: "Next",
  edgeType: EdgeType.DEFAULT,
  dataType: "any",
  description: "Flow to next node",
};
