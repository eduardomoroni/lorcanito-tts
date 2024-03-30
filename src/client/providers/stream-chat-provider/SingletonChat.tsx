// TODO: FIX THIS LATER
// THere's a problem where getStream channel take long to initialize, but we need the game engine ready as soon as possible.
// So we're using a singleton to send messages, but this is not ideal.
import { Channel as StreamChannel, Message, UserResponse } from "stream-chat";

export class SingletonChat {
  static channel: StreamChannel | undefined;
  static user: UserResponse | undefined;

  static setChannel(channel: StreamChannel) {
    this.channel = channel;
  }

  static setUser(user: UserResponse) {
    this.user = user;
  }

  static async sendMessage(
    message: Message,
    options?: {
      force_moderation?: boolean;
      is_pending_message?: boolean;
      keep_channel_hidden?: boolean;
      pending?: boolean;
      pending_message_metadata?: Record<string, string>;
      skip_enrich_url?: boolean;
      skip_push?: boolean;
    },
  ) {
    if (!this.channel) {
      console.error("Channel not set");
      return;
    }

    message.user = this.user;
    await this.channel.sendMessage(message, options);
  }
}
