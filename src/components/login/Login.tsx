import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/raya_oflogo_s.png";

export function Login({
  email,
  setEmail,
  password,
  setPassword,
  handleSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form className="w-full max-w-sm" onSubmit={handleSubmit}>
      <Card className="w-full max-w-sm shadow-[0_8px_30px_rgba(0,0,0,0.6)] border-none">
        <CardHeader>
          <div className="flex items-center justify-start gap-3 mb-6">
            <img
              src={logo}
              alt="Raya Logo"
              className="h-15 w-15 object-contain mb-1"
            />
            <h2 className="font-semibold">Steel Colors and Metal Products</h2>
          </div>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
