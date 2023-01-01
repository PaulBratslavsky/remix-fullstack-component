import { useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useTransition } from "@remix-run/react";
import { requireUserId, getUser } from "~/session.server";
import { getUserById } from "~/models/user.server";
import { likeNote, unlikeNote } from "~/models/note.server";

export async function loader({ request }) {
  const user = await getUser(request);
  if (!user) return json({ isFollowed: false });

  const url = new URL(request.url);
  const noteId = url.searchParams.get("noteId");
  const isFound = user.likedNotes.find((note) => note.noteId === noteId);

  return json({ isFollowed: isFound ? true : false });
}

export async function action({ request }) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const noteId = formData.get("noteId");
  const redirectPath = formData.get("redirectPath");

  const user = await getUserById(userId);

  const isFound = user.likedNotes.find((note) => note.noteId === noteId);

  if (!isFound) {
    await likeNote({ noteId, userId });
    return json({ isFollowed: true });
  }

  if (isFound) {
    await unlikeNote({ id: isFound.id });
    if (redirectPath) return redirect(redirectPath)
    return json({ isFollowed: false });
  }

  
}

export function NoteLikeButton({
  noteId,
  className,
  render = () => null,
  redirectPath,
}) {
  const fetcher = useFetcher();
  const { state } = useTransition();

  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load("/resources/follow?noteId=" + noteId);
    }
  }, [fetcher, noteId]);

  const isLoading = state === "submitting" || state === "loading";

  if (!fetcher.data) return null;

  return (
    <fetcher.Form method="PUT" action="/resources/follow" className={className}>
      <fieldset disabled={isLoading}>
        <input hidden name="noteId" defaultValue={noteId} />
        <input hidden name="redirectPath" defaultValue={redirectPath} />
        {render(fetcher.data.isFollowed)}
      </fieldset>
    </fetcher.Form>
  );
}
