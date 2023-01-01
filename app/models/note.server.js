import { prisma } from "~/db.server";

export function getNote({ id, userId }) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true, isPublic: true },
    where: { id, userId },
  });
}

export function getNoteListItems({ userId }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function getPublicNoteListItems() {
  return prisma.note.findMany({
    where: { isPublic: true },
    select: { id: true, title: true, body: true, isPublic: true, user: {
      select: { id: true, name: true }
    } },
    orderBy: { updatedAt: "desc" },
  });
}

export function getLikedNoteListItems({ userId }) {
  return prisma.likedNote.findMany({
    where: { userId },
    select: { note: { select: { id: true, title: true, body: true } } },
  });
}

export function getLikedNote({ noteId, userId }) {
  console.log("getLikedNote", noteId, userId)
  return prisma.likedNote.findFirst({
    where: { noteId, userId },
    select: { note: { select: { id: true, title: true, body: true, isPublic:true } } },
  });
}

export function createNote({ body, title, userId , isPublic}) {
  return prisma.note.create({
    data: {
      title,
      body,
      isPublic,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

// write function to like note based on the following
// 
// model likedNote {
//  id     String @id @default(cuid())
//  noteId String
//  userId String
//
//  note Note @relation(fields: [noteId], references: [id], onDelete: Cascade, onUpdate: Cascade)
//  user User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
//}

export function likeNote({ noteId, userId }) {
  return prisma.likedNote.create({
    data: {
      note: {
        connect: {
          id: noteId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function unlikeNote({ id }) {
  return prisma.likedNote.deleteMany({
    where: { id },
  });
}

export function deleteNote({ id, userId }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}
