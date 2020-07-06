# frozen_string_literal: true

class Api::V1::GabTrendsController < Api::BaseController
  respond_to :json

  skip_before_action :set_cache_headers

  def index
    type = params[:type]
    if type == 'feed'
      body = Redis.current.get("gabtrends:feed")
      
      if body.nil?
        uri = URI("https://trends.gab.com/trend-feed/json")
        uri.query = URI.encode_www_form({})

        res = Net::HTTP.get_response(uri)
        if res.is_a?(Net::HTTPSuccess)
          body = res.body
          Redis.current.set("gabtrends:feed", res.body) 
          Redis.current.expire("gabtrends:feed", 1.hour.seconds)
        end
      end

      render json: body
    elsif type == 'partner'
      body = Redis.current.get("gabtrends:partner")
      
      if body.nil?
        uri = URI("https://trends.gab.com/partner")
        uri.query = URI.encode_www_form({})

        res = Net::HTTP.get_response(uri)
        if res.is_a?(Net::HTTPSuccess)
          body = res.body
          Redis.current.set("gabtrends:partner", res.body) 
          Redis.current.expire("gabtrends:partner", 1.minute.seconds)
        end
      end

      render json: body
    else
      raise GabSocial::NotPermittedError
    end
  end

end
