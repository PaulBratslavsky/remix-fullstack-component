import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useFetcher, useTransition } from "@remix-run/react";
import { requireUserId, getUser } from "~/session.server";
import { getUserById } from "~/models/user.server";
import { likeNote, unlikeNote } from "~/models/note.server";
import { useNavigate } from "react-router-dom";

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
  const user = await getUserById(userId);

  const isFound = user.likedNotes.find((note) => note.noteId === noteId);

  if (!isFound) {
    await likeNote({ noteId, userId });
    return json({ isFollowed: true });
  }

  if (isFound) {
    await unlikeNote({ id: isFound.id });
    return json({ isFollowed: false });
  }
}

export function NoteFollowButton({ noteId, className, render = () => null, redirectPath }) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { state } = useTransition();


  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load("/resources/follow?noteId=" + noteId);
    }
  }, [fetcher, noteId]);


  const isLoading = state === "submitting" || state === "loading";

  if (!fetcher.data) return null;

  if (redirectPath && fetcher.data.isFollowed === false) navigate(redirectPath)

  return (
    <fetcher.Form method="PUT" action="/resources/follow" className={className}>
      <fieldset disabled={isLoading}>
        <input hidden name="noteId" defaultValue={noteId} />
        {render(fetcher.data.isFollowed)}
      </fieldset>
    </fetcher.Form>
  );
}
