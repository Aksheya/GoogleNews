from flask import Flask
from newsapi import NewsApiClient
from flask import make_response, jsonify, request
from newsapi.newsapi_exception import NewsAPIException
import json

app = Flask(__name__)
newsapi = NewsApiClient(api_key='5d469ce73f874426aef7c8b302a8a474')


# 974e822d24c849eba4a749990e70cc4c

@app.route('/')
def Index():
    return app.send_static_file('index.html')


def getHeadlines():
    try:
        top_headlines = newsapi.get_top_headlines(page_size=30)
        return top_headlines
    except:
        return {'errorNote': "Could not fetch headlines"}


@app.route('/getTopHeadlines')
def getTopHeadlines():
    top_headlines = getHeadlines()
    if top_headlines.get('articles') is not None:
        articles = top_headlines['articles']
        key_names = ['author', 'title', 'description', 'urlToImage', 'url', 'publishedAt']
        topmost5_headlines = []
        for article in articles:
            if len(topmost5_headlines) >= 5:
                break
            count = 0
            for key in key_names:
                if article.get(key) is not None and len(article.get(key)) > 0 and article.get(key).lower() != "null":
                    count += 1
            if count == 6 and article.get('source') is not None and isinstance(article.get('source'), dict):
                if article.get('source').get('name') is not None and len(article.get('source').get('name')) > 0 and article.get('source').get('name').lower() != "null":
                    topmost5_headlines.append(article)
        return make_response(jsonify({'headlines': topmost5_headlines}), 200)
    else:
        errorNote = top_headlines.get('errorNote')
        return make_response(jsonify({'errorNote': errorNote}), 200)


def getSpecificHeadlines(top_headlines):
    articles = top_headlines['articles']
    key_names = ['author', 'title', 'description', 'urlToImage', 'url', 'publishedAt']
    topmost4_headlines = []
    for article in articles:
        if len(topmost4_headlines) >= 4:
            break
        count = 0
        for key in key_names:
            if article.get(key) is not None and len(article.get(key)) > 0 and article.get(key).lower() != "null":
                count += 1
        if count == 6 and article.get('source') is not None and isinstance(article.get('source'), dict):
                if article.get('source').get('name') is not None and len(article.get('source').get('name')) > 0 and article.get('source').get('name').lower() != "null":
                    topmost4_headlines.append(article)
    return topmost4_headlines


@app.route('/getCNNHeadlines')
def getCNNHeadlines():
    try:
        top_headlines = newsapi.get_top_headlines(sources='cnn', page_size=30)
        topCNNHeadlines = getSpecificHeadlines(top_headlines)
        return make_response(jsonify({'headlines': topCNNHeadlines}), 200)
    except:
        return make_response(jsonify({'errorNote': "Could not fetch CNN news"}), 200)


@app.route('/getFOXHeadlines')
def getFOXHeadlines():
    try:
        top_headlines = newsapi.get_top_headlines(sources='fox-news', page_size=30)
        topFOXHeadlines = getSpecificHeadlines(top_headlines)
        return make_response(jsonify({'headlines': topFOXHeadlines}), 200)
    except:
        return make_response(jsonify({'errorNote': "Could not fetch FOX news"}), 200)


@app.route('/search', methods=['GET'])
def search():
    keyword = request.args.get('keyword')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    source = request.args.get('sources')
    search_results = ""
    top_results = []
    try:
        if source == 'all':
            search_results = newsapi.get_everything(q=keyword, from_param=from_date, to=to_date, language='en',
                                                    sort_by='publishedAt', page_size=30)
        else:
            search_results = newsapi.get_everything(q=keyword, sources=source, from_param=from_date, to=to_date,
                                                    language='en', sort_by='publishedAt', page_size=30)
        articles = search_results['articles']
        key_names = ['author', 'title', 'description', 'urlToImage', 'url', 'publishedAt']
        for article in articles:
            count = 0
            for key in key_names:
                if article.get(key) is not None and len(article[key]) > 0 and article[key].lower() != "null":
                    count += 1
            if count == 6 and article.get('source') is not None and isinstance(article['source'], dict):
                if article.get('source').get('name') is not None and len(article.get('source').get('name')) > 0 and article.get(
                        'source').get('name').lower() != "null":
                    top_results.append(article)
    except Exception as e:
        return make_response(jsonify({'errorNote': e.args[0]["message"]}), 200)
    return make_response(jsonify({'headlines': top_results}), 200)


@app.route('/getSources', methods=['GET'])
def getSources():
    try:
        category = request.args.get('category')
        listOfSources = newsapi.get_sources(category=category, language='en', country='us')
        total_sources = listOfSources['sources']
        if len(total_sources) < 10:
            return make_response(jsonify({'headlines': listOfSources}))
        else:
            listOfSources['sources'] = total_sources[:10]
            return make_response(jsonify({'headlines': listOfSources}))
    except:
        return make_response(jsonify({'errorNote': "Could not fetch Sources"}))


@app.route('/getDefaultSources')
def getDefaultSources():
    try:
        listOfSources = newsapi.get_sources(language='en', country='us')
        total_sources = listOfSources['sources']
        if len(total_sources) < 10:
            return make_response(jsonify({'headlines': listOfSources}))
        else:
            listOfSources['sources'] = total_sources[:10]
            return make_response(jsonify({'headlines': listOfSources}))
    except:
        return make_response(jsonify({'errorNote': "Could not fetch Sources"}))


@app.route('/wordCount')
def getWordCount():
    top_headlines = getHeadlines()
    wordCount = {}
    with open('stopwords_en.txt') as f:
        stopwords = f.read().splitlines()
    if top_headlines.get('articles') is not None:
        articles = top_headlines['articles']
        for article in articles:
            if 'title' in article and len(article.get('title')) > 0 and article.get('title').lower() != "null":
                special_characters = [';', ':', '!', "*", "-", "|"]
                article_string = ''.join(
                    character for character in article.get('title') if not character in special_characters)
                singleList = article_string.split()
                singleList = [str.lower(validword) for validword in singleList if str.lower(validword) not in stopwords]
                for word in singleList:
                    if word in wordCount:
                        wordCount[word] += 1
                    else:
                        wordCount[word] = 1
        wordCount = [[key, value] for key, value in sorted(wordCount.items(), key=lambda item: item[1], reverse=True)]
        # top30Words = [item[0] for item in wordCount[:30]]
        top30Words = []
        for item in wordCount[:30]:

            if item[1] <= 5:
                item[1] = item[1] * 7
            else:
                item[1] = item[1] * 3
            currWord = {'word': item[0], 'size': item[1]}
            top30Words.append(currWord)
        return make_response(jsonify({'headlines': top30Words}), 200)
    else:
        errorNote = top_headlines.get('errorNote')
        return make_response(jsonify({'errorNote': errorNote}), 200)


if __name__ == "__main__":
    app.run(debug=True)
