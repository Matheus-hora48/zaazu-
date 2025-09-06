import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "@/lib/types";
import { VideoIcon, Play, Eye, Edit, Trash2, Calendar } from "lucide-react";

interface VideoCardProps {
  video: Video;
  onView: (video: Video) => void;
  onEdit: (video: Video) => void;
  onDelete: (videoId: string) => void;
  formatDuration: (seconds: number) => string;
  formatDate: (date: Date) => string;
  showEpisodeNumber?: boolean;
  compact?: boolean;
}

export function VideoCard({
  video,
  onView,
  onEdit,
  onDelete,
  formatDuration,
  formatDate,
  showEpisodeNumber = false,
  compact = false,
}: VideoCardProps) {
  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md`}
    >
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative group">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <VideoIcon className="h-12 w-12 text-blue-400" />
          </div>
        )}

        {/* Episode number for series */}
        {showEpisodeNumber && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            EP {video.episodeNumber}
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            className="bg-white text-gray-800 hover:bg-gray-100"
            onClick={() => onView(video)}
          >
            <Play className="h-4 w-4 mr-1" />
            Ver
          </Button>
        </div>
      </div>

      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between mb-2">
          <h3
            className={`font-semibold text-gray-900 line-clamp-2 flex-1 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {video.title}
          </h3>
        </div>

        <p
          className={`text-gray-600 line-clamp-2 mb-3 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {video.description}
        </p>

        <div
          className={`flex items-center justify-between text-gray-500 mb-3 ${
            compact ? "text-xs" : "text-xs"
          }`}
        >
          <span className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {video.views || 0} views
          </span>
          {!compact && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(video.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                video.tag === "entretenimento"
                  ? "bg-purple-100 text-purple-800"
                  : video.tag === "educativo"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {video.tag}
            </span>
            {!compact && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {video.ageGroup}
              </span>
            )}
          </div>

          {!compact && (
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  video.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-xs text-gray-500">
                {video.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex justify-end space-x-1 pt-2 border-t border-gray-100`}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(video)}
            className={`text-blue-600 hover:text-blue-800 hover:bg-blue-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Eye className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(video)}
            className={`text-green-600 hover:text-green-800 hover:bg-green-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Edit className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(video.id)}
            className={`text-red-600 hover:text-red-800 hover:bg-red-50 ${
              compact ? "p-1" : ""
            }`}
          >
            <Trash2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
