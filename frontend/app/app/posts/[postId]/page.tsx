import { notFound } from "next/navigation";
import { Box } from "@mui/material";
import HierarchicalBreadcrumb from "@/components/ui/HierarchicalBreadcrumb";
import { PostsFeed } from "@/features/home/components/PostsFeed";
import { serverPostService } from "@/features/posts/services/postService.server";
import { Post as ApiPost } from "@/features/posts/services/postService";
import AnimatedWrapper from "../../profile/AnimatedWrapper";

async function getPost(postId: string): Promise<ApiPost | null> {
  try {
    // Fetch the specific post by ID using server-side service
    const post = await serverPostService.getPost(postId);
    return post;
  } catch (error) {
    return null;
  }
}

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  
  // Fetch the post on the server
  const post = await getPost(postId);
  
  if (!post) {
    notFound();
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      <AnimatedWrapper>
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "800px",
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: 4,
          }}
        >
          {/* Breadcrumb Navigation */}
          <Box sx={{ mb: 4 }}>
            <HierarchicalBreadcrumb
              variant="compact"
              showBackButton={true}
              showHomeIcon={true}
              customLabel={post.title}
            />
          </Box>

          {/* Post Content */}
          <PostsFeed 
            initialPosts={[post]}
            hasMoreInitial={false}
            nextCursorInitial={undefined}
            categoryFilter={null}
          />
        </Box>
      </AnimatedWrapper>
    </Box>
  );
}