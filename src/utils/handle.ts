/** "@name" for social handles; identifiers such as an ORCID iD or a badge name are shown as they are. */
export function profileHandle(username: string): string {
  return /^[a-z_][\w.]*$/i.test(username)
    ? `@${username}`
    : username
}
