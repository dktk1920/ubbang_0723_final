"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Plus, Send, MessageCircle, Calendar, ThumbsUp } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface CommunityPost {
  id: string
  author: string
  pastState: string
  actionTaken: string
  currentState: string
  likes: number
  likedByUser: boolean
  createdAt: Date
  comments: number
}

interface CommunityPageProps {
  userPk: string
}

export default function CommunityPage({ userPk }: CommunityPageProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      author: "익명의 빵친구",
      pastState: "매일 아침 일어나기가 너무 힘들었어요. 우울감이 심해서 하루 종일 침대에만 누워있고 싶었습니다.",
      actionTaken:
        "매일 아침 5분씩 명상을 시작했고, 작은 목표를 세워서 하나씩 달성해나갔어요. 친구들과 만나는 시간도 늘렸습니다.",
      currentState: "아직 완전히 좋아진 건 아니지만, 예전보다 훨씬 활기차게 하루를 시작할 수 있게 되었어요!",
      likes: 24,
      likedByUser: false,
      createdAt: new Date(2024, 0, 10),
    },
    {
      id: "2",
      author: "따뜻한 크루아상",
      pastState: "직장에서 상사와의 관계가 너무 스트레스였어요. 매일 출근하는 것이 두려웠습니다.",
      actionTaken:
        "소통 방법을 바꿔보고, 업무에 더 집중하면서 성과를 내려고 노력했어요. 스트레스 해소를 위해 운동도 시작했습니다.",
      currentState: "관계가 많이 개선되었고, 자신감도 생겼어요. 이제 출근이 그렇게 두렵지 않아요.",
      likes: 31,
      likedByUser: true,
      createdAt: new Date(2024, 0, 8),
    },
    {
      id: "3",
      author: "달콤한 마카롱",
      pastState: "연인과 헤어진 후 너무 힘들어서 아무것도 할 수 없었어요. 자존감도 많이 떨어졌습니다.",
      actionTaken: "새로운 취미를 찾아보고, 자기계발에 시간을 투자했어요. 혼자만의 시간을 즐기는 방법을 배웠습니다.",
      currentState: "혼자서도 충분히 행복할 수 있다는 걸 깨달았어요. 새로운 사람들과의 만남도 기대가 됩니다.",
      likes: 18,
      likedByUser: false,
      createdAt: new Date(2024, 0, 5),
    },
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPost, setNewPost] = useState({
    pastState: "",
    actionTaken: "",
    currentState: "",
  })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
            likedByUser: !post.likedByUser,
          }
        }
        return post
      }),
    )
  }

  const handleSubmitPost = () => {
    if (!newPost.pastState.trim() || !newPost.actionTaken.trim() || !newPost.currentState.trim()) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: user?.name || "익명의 사용자",
      pastState: newPost.pastState,
      actionTaken: newPost.actionTaken,
      currentState: newPost.currentState,
      likes: 0,
      likedByUser: false,
      createdAt: new Date(),
      comments: 0,
    }

    setPosts([post, ...posts])
    setNewPost({ pastState: "", actionTaken: "", currentState: "" })
    setShowCreateForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">우리 함께 해</h1>
            <p className="text-gray-600">서로의 경험을 나누고 함께 성장해요</p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{posts.length}</div>
              <div className="text-sm text-gray-600">공유된 이야기</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">{posts.reduce((sum, post) => sum + post.likes, 0)}</div>
              <div className="text-sm text-gray-600">받은 응원</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Post Button */}
        <Card className="bg-gradient-to-r from-pink-100 to-rose-100 border-pink-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-pink-800 mb-2">나의 이야기 나누기</h3>
                <p className="text-pink-700 text-sm">과거의 힘든 시간을 어떻게 극복했는지 공유해보세요</p>
              </div>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                이야기 쓰기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Post Form */}
        {showCreateForm && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-pink-800">새로운 이야기 작성</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">과거 상태 (어떤 어려움이 있었나요?)</label>
                <Textarea
                  value={newPost.pastState}
                  onChange={(e) => setNewPost({ ...newPost, pastState: e.target.value })}
                  placeholder="과거에 겪었던 힘든 상황이나 감정을 솔직하게 적어주세요..."
                  className="min-h-[100px] border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">극복 과정 (어떤 노력을 했나요?)</label>
                <Textarea
                  value={newPost.actionTaken}
                  onChange={(e) => setNewPost({ ...newPost, actionTaken: e.target.value })}
                  placeholder="문제를 해결하기 위해 시도했던 방법들을 구체적으로 적어주세요..."
                  className="min-h-[100px] border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">현재 상태 (지금은 어떤가요?)</label>
                <Textarea
                  value={newPost.currentState}
                  onChange={(e) => setNewPost({ ...newPost, currentState: e.target.value })}
                  placeholder="현재의 상태나 변화된 점을 적어주세요..."
                  className="min-h-[100px] border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-xl"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSubmitPost}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  이야기 공유하기
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1 border-gray-300">
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-pink-600" />
            함께 나눈 이야기들
          </h2>

          {posts.map((post) => (
            <Card
              key={post.id}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{post.author}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(post.createdAt, "yyyy년 MM월 dd일", { locale: ko })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-300">
                    <Badge className="bg-red-100 text-red-800 mb-2">과거 상태</Badge>
                    <p className="text-gray-700 text-sm leading-relaxed">{post.pastState}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
                    <Badge className="bg-blue-100 text-blue-800 mb-2">극복 과정</Badge>
                    <p className="text-gray-700 text-sm leading-relaxed">{post.actionTaken}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-300">
                    <Badge className="bg-green-100 text-green-800 mb-2">현재 상태</Badge>
                    <p className="text-gray-700 text-sm leading-relaxed">{post.currentState}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleLike(post.id)}
                    variant="ghost"
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      post.likedByUser ? "text-pink-600 hover:text-pink-700" : "text-gray-500 hover:text-pink-600"
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${post.likedByUser ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </Button>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Encouragement Message */}
        <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-8 h-8 bg-amber-300 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-amber-800 font-medium mb-2">함께라서 더 강해져요</p>
            <p className="text-amber-700 text-sm">
              모든 사람은 각자의 어려움을 겪고 있어요. 서로의 이야기를 나누며 함께 성장해나가요.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
