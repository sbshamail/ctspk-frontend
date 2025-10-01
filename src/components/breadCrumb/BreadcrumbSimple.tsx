import Link from "next/link";
import { SlashIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ClassNameType } from "@/utils/reactTypes";

interface BreadcrumbData {
  link?: string; // optional, if no link then it's the current page
  name: string;
}

interface BreadcrumbSimpleProps {
  data: BreadcrumbData[];
  className?: ClassNameType;
}

export function BreadcrumbSimple({ data, className }: BreadcrumbSimpleProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {data.map((item, index) => {
          const isLast = index === data.length - 1;

          return (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.link ?? "#"}>{item.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
