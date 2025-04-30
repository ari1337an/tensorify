import { Block as BlockNoteBlock } from "@blocknote/core";

export interface BlockContent {
  text?: string;
  type: string;
  styles?: Record<string, unknown>;
  href?: string;
  content?: BlockContent[];
}

export interface Block {
  id: string;
  type: string;
  content?: BlockContent[];
  props?: {
    url?: string;
    name?: string;
    caption?: string;
    level?: number;
    textColor?: string;
    textAlignment?: string;
    backgroundColor?: string;
    showPreview?: boolean;
    previewWidth?: number;
  };
  children?: Block[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  type?: string;
  status?: string;
  content: {
    blocks: Block[] | BlockNoteBlock[];
  };
  author: {
    name: string;
    picture: string;
    designation: string;
    profileLink: string;
  };
  createdAt: string;
  updatedAt?: string;
  tags: string[];
}
