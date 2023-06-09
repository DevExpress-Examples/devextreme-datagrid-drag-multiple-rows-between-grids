﻿using ASP_NET_Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Generic;

namespace ASP.NET_Core.Models
{
    public class InMemoryRowReorderingTasksDataContext : InMemoryDataContext<RowReorderingTask>
    {

        public InMemoryRowReorderingTasksDataContext(IHttpContextAccessor contextAccessor, IMemoryCache memoryCache)
            : base(contextAccessor, memoryCache) {
        }

        public ICollection<RowReorderingTask> Tasks => ItemsInternal;

        protected override IEnumerable<RowReorderingTask> Source => SampleData.RowReorderingTasks;

        protected override int GetKey(RowReorderingTask item) => item.ID;

        protected override void SetKey(RowReorderingTask item, int key) => item.ID = key;
    }
}
