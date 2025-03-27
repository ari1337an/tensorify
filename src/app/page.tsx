import { Button } from "@/app/_components/ui/button";

export default function Home() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-500">
        Tensorify
      </h1>
      <p className="text-gray-400">
        Tensorify Studio is a platform for writing AI pipelines visually.
      </p>
      <Button className="mt-4 hover:cursor-pointer">Get Started</Button>
    </div>
  );
}
