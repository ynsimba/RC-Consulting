<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    public function faqs()
    {
        return Faq::query()->orderBy('sort_order')->orderBy('question')->get();
    }

    public function storeFaq(Request $request)
    {
        return Faq::query()->create($this->faqData($request));
    }

    public function updateFaq(Request $request, Faq $faq)
    {
        $faq->update($this->faqData($request));

        return $faq->fresh();
    }

    public function deleteFaq(Faq $faq)
    {
        $faq->delete();

        return response()->noContent();
    }

    public function articles()
    {
        return Article::query()->with('category:id,name,slug')->orderByDesc('updated_at')->get();
    }

    public function storeArticle(Request $request)
    {
        $data = $this->articleData($request);
        $data['slug'] = $this->uniqueSlug($data['title']);
        if ($data['published']) {
            $data['published_at'] = now();
        }

        return Article::query()->create($data)->load('category:id,name,slug');
    }

    public function updateArticle(Request $request, Article $article)
    {
        $data = $this->articleData($request);
        if ($request->filled('slug')) {
            $data['slug'] = $this->uniqueSlug($request->string('slug')->toString(), $article->id);
        }
        $data['published_at'] = $data['published']
            ? ($article->published_at ?? now())
            : null;
        $article->update($data);

        return $article->fresh('category:id,name,slug');
    }

    public function deleteArticle(Article $article)
    {
        $article->delete();

        return response()->noContent();
    }

    public function categories()
    {
        return Category::query()->orderBy('name')->get();
    }

    public function storeCategory(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);
        $data['slug'] = $this->uniqueCategorySlug($data['name']);

        return Category::query()->create($data);
    }

    public function deleteCategory(Category $category)
    {
        $category->delete();

        return response()->noContent();
    }

    private function faqData(Request $request): array
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:10000'],
            'question_en' => ['nullable', 'string', 'max:255'],
            'answer_en' => ['nullable', 'string', 'max:10000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'published' => ['required', 'boolean'],
        ]);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }

    private function articleData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'excerpt' => ['required', 'string', 'max:500'],
            'content' => ['required', 'string', 'max:50000'],
            'published' => ['required', 'boolean'],
            'category_id' => ['nullable', 'uuid', Rule::exists('categories', 'id')],
            'seo_title' => ['nullable', 'string', 'max:200'],
            'seo_description' => ['nullable', 'string', 'max:300'],
        ]);
    }

    private function uniqueSlug(string $source, ?string $ignoreId = null): string
    {
        $base = Str::slug($source) ?: 'article';
        $slug = $base;
        $i = 2;
        while (
            Article::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }

    private function uniqueCategorySlug(string $name): string
    {
        $base = Str::slug($name) ?: 'categorie';
        $slug = $base;
        $i = 2;
        while (Category::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
