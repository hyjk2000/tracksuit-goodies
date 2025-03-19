interface Page {
  data: Array<{
    stories: Array<{
      id: number;
      content: {
        title: string;
      };
    }>;
  }>;
}

interface Story {
  content: {
    contentBody: {
      assets: Array<{
        type: "WIDGET" | "IMAGE";
        item: {
          content: string;
        };
      }>;
    };
  };
}
