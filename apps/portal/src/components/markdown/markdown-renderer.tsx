import { cn } from "@ziron/utils";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export const markdownClassNames =
  "max-w-none prose prose-neutral dark:prose-invert font-sans";

/**
 * Renders MDX content with GitHub Flavored Markdown support and customizable styling.
 *
 * Combines default markdown styling with any additional class names and merges the remarkGfm plugin with other remark plugins provided in the options.
 *
 * @param className - Additional CSS class names to apply to the rendered markdown container
 * @returns A React element displaying the styled MDX content
 */
export function MarkdownRenderer({
  className,
  options,
  ...props
}: MDXRemoteProps & { className?: string }) {
  return (
    <div className={cn(markdownClassNames, className)}>
      <MDXRemote
        {...props}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              ...(options?.mdxOptions?.remarkPlugins ?? []),
            ],
            ...options?.mdxOptions,
          },
        }}
      />
    </div>
  );
}
