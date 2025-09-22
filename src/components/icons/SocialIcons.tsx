import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Button } from "../ui/button";

const SocialIcons = () => {
  return (
    <div className="flex space-x-4">
      <Button
        size="sm"
        className="text-foreground hover:text-primary p-2 rounded-full"
      >
        <Facebook className="w-4 h-4 text-primary-foreground" />
      </Button>
      <Button
        size="sm"
        className="text-foreground hover:text-primary p-2 rounded-full"
      >
        <Twitter className="w-4 h-4 text-primary-foreground" />
      </Button>
      <Button
        size="sm"
        className="text-foreground hover:text-primary p-2 rounded-full"
      >
        <Instagram className="w-4 h-4 text-primary-foreground" />
      </Button>
      <Button
        size="sm"
        className="text-foreground hover:text-primary p-2 rounded-full"
      >
        <Youtube className="w-4 h-4 text-primary-foreground" />
      </Button>
    </div>
  );
};

export default SocialIcons;
