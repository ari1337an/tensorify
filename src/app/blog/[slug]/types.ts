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

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  metaRobots?: string;
  keywords?: string;
  canonicalUrl?: string;

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;

  twitterCardType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;

  blogpostingHeadline?: string;
  blogpostingDescription?: string;
  blogpostingAuthorName?: string;
  blogpostingAuthorUrl?: string;
  blogpostingPublisherName?: string;
  blogpostingPublisherLogo?: string;
  blogpostingKeywords?: string;
  blogpostingFeaturedImage?: string;

  mainEntityOfPage?: string;
  favicon?: string;
  language?: string;
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
  seo?: SEO;
}
