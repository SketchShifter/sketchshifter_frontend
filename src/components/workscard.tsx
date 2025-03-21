import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface CardProps {
  id: string;
  title: string;
  date: string;
  description: string;
  username: string;
  thumbnail: string;
}

const WorksCard: React.FC<CardProps> = ({ id, title, date, description, username, thumbnail }) => {
  return (
    <Link href={`/artworks/${id}`} passHref>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden rounded-lg p-0">
        <div className="w-full aspect-[16/9] overflow-hidden leading-none">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover block"
          />
        </div>
        <CardContent className="p-4">
          <CardTitle className="m-0 text-lg font-bold">{title}</CardTitle>
          <CardDescription className="m-0 text-sm text-gray-500 mb-5">{`by ${username}`}</CardDescription>
          <p className="mb-5">{description}</p> {/* descriptionの下にマージンを追加 */}
          <p className="m-0 text-sm text-gray-500">{date}</p>
        </CardContent>
      </Card>
    </Link>
  );
};


export default WorksCard;
