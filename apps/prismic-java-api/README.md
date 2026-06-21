# Prismic Java API

## Purpose

This is a simple Java backend API that fetches label content from Prismic and caches it in-memory.

It is intentionally small so it can be wired later into:

- Next.js
- CDN
- enterprise cache layers such as Redis or AWS caching

## What it does

Endpoint:

```txt
GET /api/prismic/labels/{locale}
```

Examples:

```txt
GET /api/prismic/labels/en
GET /api/prismic/labels/ja
GET /api/prismic/labels/en?refresh=true
```

The API:

1. reads the `ibe` parent document from Prismic
2. resolves linked child label documents
3. fetches the child documents
4. returns a single aggregated JSON response
5. caches the result in-memory by locale

## Port

Default:

```txt
4002
```

## Configuration

### Base committed config

This file is safe to commit:

```txt
src/main/resources/application.yml
```

It contains only placeholders and defaults, not real secrets.

### Local developer config

Create this file for your machine:

```txt
src/main/resources/application-local.yml
```

This file is ignored by Git.

You can copy from:

```txt
src/main/resources/application-local.yml.example
```

Example local config:

```yml
app:
  prismic:
    repository-name: your-repository-name
    access-token: your-prismic-read-token
    cache-ttl-seconds: 300
```

### Optional environment variables

```env
PRISMIC_REPOSITORY_NAME=your-repository
PRISMIC_ACCESS_TOKEN=your-read-token
PRISMIC_JAVA_CACHE_TTL_SECONDS=300
```

## Run

This app is scaffolded as a Maven Spring Boot application.

From this folder:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

This project includes:

```txt
.mvn/maven.config
```

so `mvn` will automatically use the local public Maven settings file instead of your global corporate HTTP repository settings.

or:

```bash
mvn clean package
java -jar target/prismic-java-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

## Sample response

```json
{
  "locale": "en",
  "prismicLocale": "en-us",
  "source": "prismic-java-api",
  "cached": false,
  "repository": "your-repository",
  "fetchedAt": "2026-06-21T12:00:00Z",
  "documents": {
    "ibe": {
      "id": "...",
      "type": "ibe",
      "lang": "en-us",
      "data": {}
    },
    "flight_search": {
      "id": "...",
      "type": "flight_search",
      "lang": "en-us",
      "data": {}
    }
  }
}
```

## Notes

- cache is currently in-memory only
- this is suitable for local development and early integration
- later you can replace the cache with Redis or another shared cache
- later you can also add a Prismic webhook endpoint here to clear the Java cache
