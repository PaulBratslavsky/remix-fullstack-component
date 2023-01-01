import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getLikedNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

import { NoteFollowButton } from '../resources/follow';

export async function loader({ request, params }) {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getLikedNote({ noteId: params.noteId, userId });
  if (!note) throw new Response("Not Found", { status: 404 });

  return json({ note });
}

export default function NoteDetailsPage() {
  const { note } = useLoaderData().note;

  return (
    <div className='relative'>
      <h3 className="text-2xl font-bold">{note.title}</h3>
      <p className="py-6">{note.body}</p>
      <p className="text-sm text-gray-500">
        {note.isPublic ? "Public" : "Private"}
      </p>
      <NoteFollowButton
        className="absolute top-0 right-0"
        redirectPath={`/liked`}
        noteId={note.id}
        render={(isFollowed) => (
          <button type="submit" className="rounded-full bg-teal-500 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isFollowed ? "#ec4899" : "white"}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
              />
            </svg>
          </button>
        )}
      />
      <hr className="my-4" />
    </div>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}