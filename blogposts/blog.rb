#markdown
require 'redcarpet'
require 'date'

#blog posts
module BLOG
    @@markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, {
        :autolink => true,
        :space_after_headers => true
    })
    @@posts = [
        {
            :title => "Deliberately Learn Stuff",
            :file => "deliberate.md",
            :name => "deliberately-learn-stuff",
            :date => "17 March 2013",
            :previewlen => 200,
            :tags => []
        },
        {
            :title => "Three Down",
            :file => "three-down.md",
            :name => "three-down",
            :date => "30 November 2012",
            :previewlen => 200,
            :tags => []
        },
        {
            :title => "Decisions",
            :file => "../cs3216/decisions.md",
            :name => "decisions",
            :date => "8 October 2012",
            :previewlen => 200,
            :tags => [ "reflection" ]
        },
        {
            :title => "why MODIVLE",
            :file => "modivle.md",
            :name => "why-modivle",
            :date => "2 October 2012",
            :previewlen => 200,
            :tags => ["MODIVLE"]
        },
        {
            :title => "Disappointed",
            :file => "../cs3216/disappointed.md",
            :name => "disappinted",
            :date => "1 October 2012",
            :previewlen => 200,
            :tags => [ "reflection" ]
        },
        {
            :title => "Why my team is building a todo list",
            :file => "../cs3216/todolist.md",
            :name => "why-my-team-is-building-a-todo-list",
            :date => "16 September 2012",
            :previewlen => 200,
            :tags => []
        },
        {
            :title => "Working together in the 21st Century",
            :file => "../cs3216/working-together.md",
            :name => "working-together",
            :date => "3 September 2012",
            :previewlen => 200,
            :tags => []
        },
        {
            :title => "Redesigning Hush",
            :file => "../cs3216/redesigning-hush.md",
            :name => "redesigning-hush",
            :date => "3 September 2012",
            :previewlen => 200,
            :tags => [ "hush" ]
        },
        {
            :title => "My talent",
            :file => "../cs3216/my-talent.md",
            :name => "my-talent",
            :date => "20 August 2012",
            :previewlen => 200,
            :tags => []
        },
        {
            :title => "What I hope to learn in CS3216",
            :file => "../cs3216/what-i-hope-to-learn.md",
            :name => "what-i-hope-to-learn",
            :date => "9 August 2012",
            :previewlen => 200,
            :tags => [ "reflection" ]
        },
        {
            :title => "I suck at hackathons",
            :file => "i-suck-at-hackathons.md",
            :name => "i-suck-at-hackathons",
            :date => "10 June 2012",
            :previewlen => 200,
            :tags => []
        },
        {
            :title => "Remembering why I code",
            :file => "remembering-why-i-code.md",
            :name => "remembering-why-i-code",
            :date => "7 June 2012",
            :previewlen => 400,
            :tags => []
        }
    ]

    def self.posts
        @@posts.map do |x|
            x[:isodate] = Date.parse(x[:date]).to_s
            x
        end
    end

    def self.posts_for_rss
        @@posts.map do |x|
            x[:isodate] = Date.parse(x[:date]).rfc822
            x[:md] = @@markdown.render(File.open("./blogposts/" + x[:file]).read)
            x
        end
    end

    def self.post(name)
        result = @@posts.select { |post| post[:name] == name }

        if result.length == 1
            x = result[0]
            x[:isodate] = Date.parse(x[:date]).to_s
            x[:md] = @@markdown.render(File.open("./blogposts/" + x[:file]).read)
            return result[0]
        else
            return false
        end
    end
end
