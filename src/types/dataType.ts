export interface Work {
    id: string;
    title: string;
    created_at: string;
    description: string;
    user: {
      nickname: string;
      updated_at: string;
    };
    thumbnail_url: string;
    tags: {
      id: number;
      name: string;
    }[];
    likes_count: number;
    views: number;
    code_shared: boolean;
    code_content: string;
  }
  
  export interface ApiResponse {
    works: Work[];
  }