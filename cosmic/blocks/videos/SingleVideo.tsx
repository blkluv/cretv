/* eslint-disable @next/next/no-img-element */
import { cosmic } from "@/cosmic/client";
import { notFound } from "next/navigation";
import { TimeAgo } from "@/components/TimeAgo";
import { VideoType } from "./VideoCard";
import { PlayArea } from "./PlayArea";
import Link from "next/link";
import { CategoryPill, CategoryType } from "./CategoryPill";
import { Comments } from "@/cosmic/blocks/comments/Comments";
import { FollowButton } from "./FollowButton";
export async function SingleVideo({
  query,
  className,
  status,
}: {
  query: any;
  className?: string;
  status?: "draft" | "published" | "any";
}) {
  try {
    const { object: video }: { object: VideoType } = await cosmic.objects
      .findOne(query)
      .props(
        `{
          id
          slug
          title
          created_at
          metadata
        }`
      )
      .depth(1)
      .status(status ? status : "published")
      .options({
        media: {
          props: "alt_text",
        },
      });

    return (
      <div className={className}>
        <div className="w-full">
          <PlayArea video={video} />
        </div>
        <section className="m-auto grid items-center pb-8 md:container p-4 pt-8 mb-8">
          <div className="relative m-auto flex w-full md:w-[750px] flex-col items-start gap-2">
            <div className="flex items-center justify-between w-full">
              <h1
                data-cosmic-object={video.id}
                className="mb-4 text-3xl font-extrabold leading-tight tracking-tighter text-black dark:text-white md:text-4xl"
              >
                {video.title}
              </h1>
              <FollowButton channelId={video.metadata.channel.id} />
            </div>
            <div className="mb-2 md:flex gap-4">
              <Link
                href={`/channels/${video.metadata.channel.slug}`}
                className="flex items-center gap-3 mb-4"
              >
                <img
                  className="mr-2 h-[60px] w-[60px] rounded-full object-cover"
                  src={`${video.metadata.channel.metadata.thumbnail.imgix_url}?w=120&auto=format,compression`}
                  alt={video.metadata.channel.metadata.thumbnail.alt_text}
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {video.metadata.channel.title}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    <TimeAgo time={video.created_at} />
                  </span>
                </div>
              </Link>
              <div className="md:absolute md:right-0 flex">
                {video.metadata.categories.map((category: CategoryType) => {
                  return <CategoryPill key={category.id} category={category} />;
                })}
              </div>
            </div>
            <div
              className="space-y-4 text-zinc-700 dark:text-zinc-300"
              dangerouslySetInnerHTML={{ __html: video.metadata.description }}
            />
          </div>
        </section>
        <Comments
          query={{
            type: "comments",
            "metadata.resource": video.id,
            "metadata.approved": true,
          }}
        />
      </div>
    );
  } catch (e: any) {
    if (e.status === 404) return notFound();
  }
}
