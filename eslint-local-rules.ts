import type { Rule, SourceCode } from 'eslint'

const ALLOWED = /^\s*(eslint-|eslint |globals?\s|exported\s|prettier-ignore|@ts-|v-pre|vue-)/

interface CommentPosition {
  line: number
  column: number
}

interface CommentLocation {
  start: CommentPosition
  end: CommentPosition
}

interface LocatedComment {
  value: string
  loc?: CommentLocation | null
}

interface DocumentFragment {
  comments?: LocatedComment[]
}

interface VueParserServices {
  getDocumentFragment?: () => DocumentFragment | null | undefined
}

function documentFragmentComments(sourceCode: SourceCode): LocatedComment[] {
  const services: VueParserServices = sourceCode.parserServices
  const fragment = services.getDocumentFragment?.()
  return fragment?.comments ?? []
}

export const noComments: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow comments in source files so intent is carried by naming',
    },
    schema: [],
    messages: {
      unexpected: 'Comments are not allowed in src/. Rename things so the code explains itself.',
    },
  },

  create(context) {
    const seen = new Set<string>()

    const report = (comment: LocatedComment): void => {
      if (ALLOWED.test(comment.value) || !comment.loc) {
        return
      }

      const key = `${comment.loc.start.line}:${comment.loc.start.column}`
      if (seen.has(key)) {
        return
      }
      seen.add(key)

      context.report({ loc: comment.loc, messageId: 'unexpected' })
    }

    return {
      Program(): void {
        for (const comment of context.sourceCode.getAllComments()) {
          report(comment)
        }
        for (const comment of documentFragmentComments(context.sourceCode)) {
          report(comment)
        }
      },
    }
  },
}

export const localPlugin = {
  rules: { 'no-comments': noComments },
}
