export interface Context {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}
